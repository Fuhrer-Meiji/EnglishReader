import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function getPipelinePaths() {
  const cwd = process.cwd();
  // 1. Run inside apps/web
  const p1 = path.join(cwd, '..', 'pipeline', 'main.py');
  if (fs.existsSync(p1)) {
    return {
      mainScript: path.resolve(p1),
      cacheDir: path.resolve(cwd, '..', 'pipeline', 'cache'),
      booksDir: path.resolve(cwd, 'data', 'books'),
    };
  }
  // 2. Run from repo root
  const p2 = path.join(cwd, 'apps', 'pipeline', 'main.py');
  if (fs.existsSync(p2)) {
    return {
      mainScript: path.resolve(p2),
      cacheDir: path.resolve(cwd, 'apps', 'pipeline', 'cache'),
      booksDir: path.resolve(cwd, 'apps', 'web', 'data', 'books'),
    };
  }
  return {
    mainScript: path.resolve(cwd, '..', 'pipeline', 'main.py'),
    cacheDir: path.resolve(cwd, '..', 'pipeline', 'cache'),
    booksDir: path.resolve(cwd, 'data', 'books'),
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '请选择要上传的 EPUB 文件' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.epub')) {
      return NextResponse.json({ error: '仅支持 .epub 格式的电子书' }, { status: 400 });
    }

    // 1. Buffer file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length < 500) {
      return NextResponse.json({ error: 'EPUB 文件内容过小，请检查是否完整' }, { status: 400 });
    }

    const { mainScript, cacheDir, booksDir } = getPipelinePaths();
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.mkdirSync(booksDir, { recursive: true });

    const safeBaseName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const tempFilePath = path.join(cacheDir, `upload_${Date.now()}_${safeBaseName}`);
    fs.writeFileSync(tempFilePath, buffer);

    console.log(`[UploadAPI] Saved temp EPUB: ${tempFilePath} (${Math.round(buffer.length / 1024)} KB)`);
    console.log(`[UploadAPI] Running pipeline script: ${mainScript}`);

    // 2. Execute Python pipeline
    const { stdout, stderr } = await execFileAsync('python3', [mainScript, '--file', tempFilePath], {
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });

    if (stderr && stderr.trim().length > 0) {
      console.warn(`[UploadAPI] Pipeline stderr:`, stderr);
    }

    // 3. Extract metadata from pipeline stdout
    let meta: any = null;
    const lines = stdout.split('\n');
    for (const line of lines) {
      if (line.startsWith('__BOOK_METADATA__:')) {
        try {
          meta = JSON.parse(line.substring('__BOOK_METADATA__:'.length).trim());
          break;
        } catch (e) {
          console.error('[UploadAPI] Failed to parse metadata line:', e);
        }
      }
    }

    if (!meta) {
      return NextResponse.json(
        { error: '书籍解析未返回有效数据，请检查该 EPUB 是否包含标准章节' },
        { status: 500 }
      );
    }

    console.log(`[UploadAPI] Successfully parsed book: ${meta.title} (${meta.id})`);

    return NextResponse.json({
      success: true,
      book: meta,
      message: `成功解析《${meta.title}》，共 ${meta.totalChapters} 章节，约 ${meta.wordCount.toLocaleString()} 词。`,
    });
  } catch (error: any) {
    console.error('[UploadAPI] Error processing upload:', error);
    return NextResponse.json(
      { error: `解析失败: ${error.message || '未知错误'}` },
      { status: 500 }
    );
  }
}
