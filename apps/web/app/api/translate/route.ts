import { NextRequest, NextResponse } from 'next/server';

function normalizeChatUrl(baseUrl: string): string {
  let url = baseUrl.trim();
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  if (!url.endsWith('/chat/completions')) {
    url = `${url}/chat/completions`;
  }
  return url;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text = '',
      aiConfig,
      bookTitle = '传世原著',
      author = '文学名家',
    } = body;

    const trimmedText = text.trim();
    if (!trimmedText) {
      return NextResponse.json({ error: '待翻译文本不能为空' }, { status: 400 });
    }

    // 1. Try AI Literary Translation if user has configured API Key
    if (aiConfig?.apiKey && typeof aiConfig.apiKey === 'string' && aiConfig.apiKey.trim()) {
      try {
        const endpointUrl = normalizeChatUrl(aiConfig.apiBaseUrl || 'https://api.deepseek.com');
        const modelName = aiConfig.model?.trim() || 'deepseek-chat';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

        const aiRes = await fetch(endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${aiConfig.apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              {
                role: 'system',
                content: `你是一位深谙 19~20 世纪英美经典文学、修辞美学与翻译技巧的文学翻译家（兼具奥斯卡·王尔德般精巧优雅的文字品味）。
请将读者选自《${bookTitle}》（作者：${author}）的原文文本翻译为流畅、优美、信达雅的中文。
请注意：
1. 恪守原文意蕴与修辞美感，切忌生硬机翻；
2. 只输出最终中文译文正文，绝对不要添加任何前言、解释、引号、拼音或“译文如下”等标记。`,
              },
              {
                role: 'user',
                content: `请翻译以下原文：\n\n${trimmedText}`,
              },
            ],
            temperature: 0.3,
            max_tokens: 600,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (aiRes.ok) {
          const data = await aiRes.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) {
            return NextResponse.json({
              success: true,
              translation: content,
              isAI: true,
              model: modelName,
            });
          }
        }
      } catch (aiErr) {
        console.warn('[Translate API] AI translate fallback triggered:', aiErr);
      }
    }

    // 2. Fast Free Neural Translation (MyMemory / Public Engine)
    try {
      const q = encodeURIComponent(trimmedText.slice(0, 500));
      const freeUrl = `https://api.mymemory.translated.net/get?q=${q}&langpair=en|zh`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const freeRes = await fetch(freeUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (freeRes.ok) {
        const freeData = await freeRes.json();
        let translatedText = freeData.responseData?.translatedText;
        if (translatedText && typeof translatedText === 'string') {
          // If MyMemory returns warning about quota or untranslated, filter it
          if (!translatedText.includes('MYMEMORY WARNING:')) {
            return NextResponse.json({
              success: true,
              translation: translatedText.trim(),
              isAI: false,
            });
          }
        }
      }
    } catch (freeErr) {
      console.warn('[Translate API] Free translation error:', freeErr);
    }

    // 3. Fallback message if all remote translation services fail
    return NextResponse.json({
      success: true,
      translation: '暂未获取到即时译文，建议在设置中开启 AI 配置以体验高精度文学级翻译。',
      isAI: false,
      fallback: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '翻译服务异常，请稍后重试' },
      { status: 500 }
    );
  }
}
