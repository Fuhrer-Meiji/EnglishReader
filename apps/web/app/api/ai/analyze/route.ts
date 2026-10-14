import { NextRequest, NextResponse } from 'next/server';

function cleanJsonContent(content: string): string {
  let cleaned = content.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

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
      apiBaseUrl = 'https://api.deepseek.com',
      apiKey,
      model = 'deepseek-chat',
      task = 'sentence',
      sentence = '',
      context = '',
      word = '',
      bookTitle = '传世原著',
      author = '文学名家',
    } = body;

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return NextResponse.json(
        { error: '尚未配置 API Key。请在设置中配置你的 API Key（支持 DeepSeek / OpenAI 等）。' },
        { status: 400 }
      );
    }

    const endpointUrl = normalizeChatUrl(apiBaseUrl);

    // Task 1: Connectivity Test
    if (task === 'test') {
      const startTime = Date.now();
      const testRes = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: model.trim() || 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: 'Hello! Please reply with exactly: "Wilde AI Connected Successfully".',
            },
          ],
          max_tokens: 30,
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!testRes.ok) {
        let errMsg = `接口请求失败 (HTTP ${testRes.status})`;
        try {
          const errData = await testRes.json();
          if (errData.error?.message) {
            errMsg = errData.error.message;
          }
        } catch (e) {}
        return NextResponse.json({ error: errMsg, latencyMs }, { status: testRes.status });
      }

      return NextResponse.json({
        success: true,
        latencyMs,
        message: '连接成功！API 正常响应。',
      });
    }

    // Task 2: Sentence Deep Literary & Syntactic Breakdown
    if (task === 'sentence') {
      if (!sentence.trim()) {
        return NextResponse.json({ error: '原著句子不能为空' }, { status: 400 });
      }

      const systemPrompt = `你是一位深谙 19~20 世纪英美经典文学、修辞学与句法分析的学者（兼具奥斯卡·王尔德般精巧优雅的文学品味）。
请为读者深度剖析以下选自原著《${bookTitle}》（作者：${author}）的原文语句。

必须输出严格合法的 JSON 数据，不要包含任何额外的问候或 markdown 说明，字段结构严格如下：
{
  "literaryTranslation": "文学级精雅中文译文（信达雅，严禁机械生硬机翻，符合原作者文风与时代语调）",
  "syntaxHierarchy": [
    {
      "component": "语法成分名称（如：主句主干 / 非谓语动词短语 / 定语从句 / 倒装结构 / 伴随状语 / 虚拟语气）",
      "content": "对应的原句英文片段",
      "explanation": "该成分在整句结构逻辑中的语法剖析"
    }
  ],
  "literaryNotes": "文学修辞与文化隐喻深度注脚（指出文中暗含的修辞手法如反讽/隐喻/双关/拟人、时代文化背景或典故出处）",
  "keyExpressions": [
    {
      "expression": "重点习语或高阶表达",
      "meaning": "在本文中的精确含义与地道用法拓展"
    }
  ]
}`;

      const userContent = `原著语句：${sentence}
${context ? `所在上下文：${context}` : ''}`;

      const apiRes = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: model.trim() || 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          temperature: 0.3,
        }),
      });

      if (!apiRes.ok) {
        let errMsg = `大模型调用失败 (HTTP ${apiRes.status})`;
        try {
          const errData = await apiRes.json();
          if (errData.error?.message) {
            errMsg = errData.error.message;
          }
        } catch (e) {}
        return NextResponse.json({ error: errMsg }, { status: apiRes.status });
      }

      const resData = await apiRes.json();
      const rawContent = resData.choices?.[0]?.message?.content || '{}';
      const cleaned = cleanJsonContent(rawContent);

      try {
        const parsed = JSON.parse(cleaned);
        return NextResponse.json({ success: true, data: parsed });
      } catch (err) {
        // Fallback if model didn't return perfect JSON
        return NextResponse.json({
          success: true,
          data: {
            literaryTranslation: cleaned,
            syntaxHierarchy: [],
            literaryNotes: '解析完成',
            keyExpressions: [],
          },
        });
      }
    }

    // Task 3: Word Contextual Nuance
    if (task === 'word') {
      if (!word.trim()) {
        return NextResponse.json({ error: '生词不能为空' }, { status: 400 });
      }

      const systemPrompt = `你是一位精通英美经典文学与词源学的学者。请结合原著《${bookTitle}》的上下文语句，剖析生词 "${word}" 在该句中的语境涵义。
必须输出严格合法的 JSON 数据：
{
  "word": "${word}",
  "contextMeaning": "该生词在当前原著语境下的精确含义（重点指出是否为熟词生义、特殊借喻或特定时代用法）",
  "literaryNuance": "词源考据与作者选用该词的文学意图/审美情调",
  "collocations": [
    {
      "phrase": "经典搭配或派生高频词组",
      "meaning": "含义解析"
    }
  ]
}`;

      const userContent = `生词：${word}
原句上下文：${sentence || context || '无特定上下文'}`;

      const apiRes = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: model.trim() || 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          temperature: 0.3,
        }),
      });

      if (!apiRes.ok) {
        let errMsg = `大模型调用失败 (HTTP ${apiRes.status})`;
        try {
          const errData = await apiRes.json();
          if (errData.error?.message) {
            errMsg = errData.error.message;
          }
        } catch (e) {}
        return NextResponse.json({ error: errMsg }, { status: apiRes.status });
      }

      const resData = await apiRes.json();
      const rawContent = resData.choices?.[0]?.message?.content || '{}';
      const cleaned = cleanJsonContent(rawContent);

      try {
        const parsed = JSON.parse(cleaned);
        return NextResponse.json({ success: true, data: parsed });
      } catch (err) {
        return NextResponse.json({
          success: true,
          data: {
            word,
            contextMeaning: cleaned,
            literaryNuance: '',
            collocations: [],
          },
        });
      }
    }

    return NextResponse.json({ error: '未知的 AI 任务类型' }, { status: 400 });
  } catch (err: any) {
    console.error('[AI API Error]:', err);
    return NextResponse.json({ error: err.message || '服务器内部错误' }, { status: 500 });
  }
}
