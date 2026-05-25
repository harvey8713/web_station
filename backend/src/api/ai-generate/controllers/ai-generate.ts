import axios from 'axios';

const QWEN_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

// Railway uses 'zh-CN', local dev SQLite uses 'zh'
const ZH_LOCALE = process.env.ZH_LOCALE || 'zh-CN';

async function callQwen(messages: Array<{ role: string; content: string }>, maxTokens = 3000) {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) throw new Error('QWEN_API_KEY 未配置');

  const response = await axios.post(
    QWEN_URL,
    {
      model: 'qwen3-235b-a22b',
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 120000,
    }
  );

  return response.data.choices[0].message.content as string;
}

function extractJson(text: string) {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const raw = codeBlock ? codeBlock[1] : text.match(/(\{[\s\S]*\})/)?.[1];
  if (!raw) throw new Error('AI 返回内容无法解析为 JSON，请重试');
  return JSON.parse(raw);
}

function readingTime(text: string, lang: 'zh' | 'en') {
  const cleaned = text.replace(/[#*>`\-\s]/g, '');
  return Math.max(1, Math.ceil(cleaned.length / (lang === 'zh' ? 300 : 800)));
}

export default {
  async translate(ctx: any) {
    const { documentId } = ctx.request.body as { documentId?: string };

    if (!documentId?.trim()) {
      return ctx.badRequest('请提供 documentId');
    }

    // Fetch the zh version — try draft first, fall back to published
    let zhDoc = await (strapi as any).documents('api::article.article').findOne({
      documentId,
      locale: ZH_LOCALE,
      status: 'draft',
    });
    if (!zhDoc) {
      zhDoc = await (strapi as any).documents('api::article.article').findOne({
        documentId,
        locale: ZH_LOCALE,
        status: 'published',
      });
    }

    if (!zhDoc) {
      return ctx.notFound('未找到该文章的中文版本');
    }

    const { title, excerpt, content } = zhDoc;

    if (!title && !content) {
      return ctx.badRequest('中文版本内容为空，请先填写标题和正文');
    }

    try {
      const enUserPrompt = `Translate the following JSON content into professional English. Maintain the jewellery brand tone: minimalist, architectural, artistic. Keep the same Markdown structure in the content field.

\`\`\`json
${JSON.stringify({ title, excerpt, content }, null, 2)}
\`\`\`

Output strictly in JSON format:
\`\`\`json
{
  "title": "English title",
  "excerpt": "English excerpt (may be null if original is null)",
  "content": "English content in Markdown (may be null if original is null)"
}
\`\`\``;

      const enRaw = await callQwen([{ role: 'user', content: enUserPrompt }]);
      const en = extractJson(enRaw);

      // Save English localization
      await (strapi as any).documents('api::article.article').update({
        documentId,
        data: {
          title: en.title,
          excerpt: en.excerpt ?? null,
          content: en.content ?? null,
          reading_time: en.content ? readingTime(en.content, 'en') : zhDoc.reading_time,
          slug: zhDoc.slug,
        },
        locale: 'en',
        status: 'draft',
      });

      // Publish both locales
      await (strapi as any).documents('api::article.article').publish({
        documentId,
        locale: ZH_LOCALE,
      });
      await (strapi as any).documents('api::article.article').publish({
        documentId,
        locale: 'en',
      });

      ctx.body = {
        success: true,
        data: {
          documentId,
          zhTitle: title,
          enTitle: en.title,
        },
      };
    } catch (error: any) {
      (strapi as any).log.error('AI 翻译失败:', error.message);
      return ctx.badRequest(error.message || 'AI 翻译失败，请重试');
    }
  },

  async generate(ctx: any) {
    const { prompt } = ctx.request.body as { prompt?: string };

    if (!prompt?.trim()) {
      return ctx.badRequest('请提供文章描述');
    }

    try {
      // ── Step 1: 生成中文文章 ──────────────────────────────────
      const zhSystemPrompt = `你是一位专业的珠宝品牌内容创作者。
品牌调性：极简精致、建筑美学、艺术性表达、高端定位。
写作要求：短句有力、善用留白、融入哲学思考，避免堆砌形容词。`;

      const zhUserPrompt = `根据以下描述创作一篇中文文章：

${prompt}

严格按照以下 JSON 格式输出，不要有其他内容：
\`\`\`json
{
  "title": "文章标题（15字以内）",
  "excerpt": "文章摘要（80字以内，精炼概括核心观点）",
  "content": "文章正文（Markdown格式，800-1500字，包含 ## 二级标题、段落、> 引用块等）"
}
\`\`\``;

      const zhRaw = await callQwen([
        { role: 'system', content: zhSystemPrompt },
        { role: 'user', content: zhUserPrompt },
      ]);

      const zh = extractJson(zhRaw);

      // ── Step 2: 翻译为英文 ────────────────────────────────────
      const enUserPrompt = `Translate the following JSON content into professional English. Maintain the jewellery brand tone: minimalist, architectural, artistic. Keep the same Markdown structure.

\`\`\`json
${JSON.stringify(zh, null, 2)}
\`\`\`

Output strictly in JSON format:
\`\`\`json
{
  "title": "English title",
  "excerpt": "English excerpt",
  "content": "English content in Markdown"
}
\`\`\``;

      const enRaw = await callQwen([{ role: 'user', content: enUserPrompt }]);
      const en = extractJson(enRaw);

      // ── Step 3: 创建中文草稿 ──────────────────────────────────
      const zhDoc = await (strapi as any).documents('api::article.article').create({
        data: {
          title: zh.title,
          excerpt: zh.excerpt,
          content: zh.content,
          reading_time: readingTime(zh.content, 'zh'),
          published_date: new Date().toISOString(),
        },
        locale: ZH_LOCALE,
        status: 'draft',
      });

      // ── Step 4: 创建英文本地化草稿 ───────────────────────────
      await (strapi as any).documents('api::article.article').update({
        documentId: zhDoc.documentId,
        data: {
          title: en.title,
          excerpt: en.excerpt,
          content: en.content,
          reading_time: readingTime(en.content, 'en'),
        },
        locale: 'en',
        status: 'draft',
      });

      ctx.body = {
        success: true,
        data: {
          documentId: zhDoc.documentId,
          zhTitle: zh.title,
          enTitle: en.title,
        },
      };
    } catch (error: any) {
      (strapi as any).log.error('AI 文章生成失败:', error.message);
      return ctx.badRequest(error.message || 'AI 生成失败，请重试');
    }
  },
};
