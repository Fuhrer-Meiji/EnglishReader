import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function getPipelinePaths() {
  const cwd = process.cwd();
  const p1 = path.join(cwd, '..', 'pipeline', 'main.py');
  if (fs.existsSync(p1)) {
    return {
      mainScript: path.resolve(p1),
      cacheDir: path.resolve(cwd, '..', 'pipeline', 'cache'),
      booksDir: path.resolve(cwd, 'data', 'books'),
    };
  }
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
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ error: '缺少书籍 slug 参数' }, { status: 400 });
    }

    const { mainScript, booksDir } = getPipelinePaths();
    const targetJsonPath = path.join(booksDir, `${slug}.json`);

    // 1. If already compiled, return directly
    if (fs.existsSync(targetJsonPath)) {
      try {
        const raw = fs.readFileSync(targetJsonPath, 'utf-8');
        const existingData = JSON.parse(raw);
        return NextResponse.json({
          success: true,
          alreadyExists: true,
          book: {
            id: existingData.id,
            title: existingData.title,
            author: existingData.author,
            totalChapters: existingData.totalChapters,
            wordCount: existingData.chapters
              ? existingData.chapters.reduce((sum: number, c: any) => sum + (c.stats?.wordCount || 0), 0)
              : 0,
            cefr: existingData.chapters?.[0]?.stats?.cefr || 'B2',
            lexile: existingData.chapters?.[0]?.stats?.lexile || '950L',
          },
          message: `《${existingData.title}》已在本地书架中`,
        });
      } catch (e) {
        console.warn(`[ImportAPI] Failed reading existing file, recompiling...`);
      }
    }

    // 2. Otherwise invoke Python pipeline to download & compile
    console.log(`[ImportAPI] Downloading and compiling '${slug}' via ${mainScript}...`);
    const { stdout, stderr } = await execFileAsync('python3', [mainScript, '--book', slug], {
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });

    if (stderr && stderr.trim().length > 0) {
      console.warn(`[ImportAPI] Pipeline stderr:`, stderr);
    }

    // 3. Extract metadata
    let meta: any = null;
    const lines = stdout.split('\n');
    for (const line of lines) {
      if (line.startsWith('__BOOK_METADATA__:')) {
        try {
          meta = JSON.parse(line.substring('__BOOK_METADATA__:'.length).trim());
          break;
        } catch (e) {
          console.error('[ImportAPI] Failed to parse metadata line:', e);
        }
      }
    }

    if (!meta) {
      return NextResponse.json(
        { error: `下载并编译《${slug}》失败，请稍后重试` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      book: meta,
      message: `成功入库《${meta.title}》，已自动完成分级评测！`,
    });
  } catch (error: any) {
    console.error('[ImportAPI] Error importing book:', error);
    return NextResponse.json(
      { error: `导入失败: ${error.message || '未知错误'}` },
      { status: 500 }
    );
  }
}
