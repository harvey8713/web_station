import axios from 'axios';

const QWEN_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const ZH_LOCALE = process.env.ZH_LOCALE || 'zh-CN';

// ── Qwen ─────────────────────────────────────────────────────────────────────

async function callQwen(messages: Array<{ role: string; content: string }>, maxTokens = 3000) {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) throw new Error('QWEN_API_KEY 未配置');
  const response = await axios.post(
    QWEN_URL,
    { model: 'qwen3-235b-a22b', messages, temperature: 0.7, max_tokens: maxTokens },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
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

// ── Blocks ↔ Markdown 互转 ────────────────────────────────────────────────────

function parseInline(text: string): any[] {
  const children: any[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      children.push({ type: 'text', text: part.slice(2, -2), bold: true });
    } else if (part.startsWith('*') && part.endsWith('*')) {
      children.push({ type: 'text', text: part.slice(1, -1), italic: true });
    } else if (part.startsWith('`') && part.endsWith('`')) {
      children.push({ type: 'text', text: part.slice(1, -1), code: true });
    } else {
      children.push({ type: 'text', text: part });
    }
  }
  return children.length > 0 ? children : [{ type: 'text', text: '' }];
}

function markdownToBlocks(md: string): any[] {
  if (!md?.trim()) return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
  const blocks: any[] = [];
  const lines = md.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // Headings
    if (line.startsWith('### ')) {
      blocks.push({ type: 'heading', level: 3, children: parseInline(line.slice(4).trim()) });
      i++; continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', level: 2, children: parseInline(line.slice(3).trim()) });
      i++; continue;
    }
    if (line.startsWith('# ')) {
      blocks.push({ type: 'heading', level: 1, children: parseInline(line.slice(2).trim()) });
      i++; continue;
    }

    // Divider
    if (/^[-*_]{3,}$/.test(line.trim())) {
      blocks.push({ type: 'divider', children: [{ type: 'text', text: '' }] });
      i++; continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: 'quote', children: parseInline(quoteLines.join(' ')) });
      continue;
    }

    // Image
    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      blocks.push({
        type: 'image',
        image: { url: imgMatch[2], alternativeText: imgMatch[1] || '' },
        children: [{ type: 'text', text: imgMatch[1] || '' }],
      });
      i++; continue;
    }

    // Unordered list
    if (/^[-*] /.test(line)) {
      const items: any[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push({ type: 'list-item', children: parseInline(lines[i].slice(2)) });
        i++;
      }
      blocks.push({ type: 'list', format: 'unordered', children: items });
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const items: any[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push({ type: 'list-item', children: parseInline(lines[i].replace(/^\d+\. /, '')) });
        i++;
      }
      blocks.push({ type: 'list', format: 'ordered', children: items });
      continue;
    }

    // Paragraph — collect consecutive plain lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^#{1,3} /.test(lines[i]) &&
      !lines[i].startsWith('> ') &&
      !/^[-*] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i]) &&
      !/^[-*_]{3,}$/.test(lines[i].trim()) &&
      !/^!\[/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', children: parseInline(paraLines.join(' ')) });
    }
  }

  return blocks.length > 0 ? blocks : [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
}

function inlineToText(children: any[]): string {
  if (!children) return '';
  return children.map(child => {
    if (child.type !== 'text') return '';
    let text = child.text || '';
    if (child.bold) text = `**${text}**`;
    if (child.italic) text = `*${text}*`;
    if (child.code) text = `\`${text}\``;
    return text;
  }).join('');
}

function blocksToMarkdown(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  const lines: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        lines.push(inlineToText(block.children)); lines.push(''); break;
      case 'heading':
        lines.push(`${'#'.repeat(block.level || 2)} ${inlineToText(block.children)}`); lines.push(''); break;
      case 'quote':
        lines.push(`> ${inlineToText(block.children)}`); lines.push(''); break;
      case 'divider':
        lines.push('---'); lines.push(''); break;
      case 'image': {
        const alt = block.image?.alternativeText || '';
        const url = block.image?.url || '';
        lines.push(`![${alt}](${url})`);
        const caption = block.children?.[0]?.text;
        if (caption && caption !== alt) lines.push(`*${caption}*`);
        lines.push(''); break;
      }
      case 'list':
        for (const item of block.children || []) {
          const prefix = block.format === 'ordered' ? '1.' : '-';
          lines.push(`${prefix} ${inlineToText(item.children)}`);
        }
        lines.push(''); break;
    }
  }
  return lines.join('\n').trim();
}

function blocksToPlainText(blocks: any[]): string {
  if (!blocks) return '';
  return blocks.map(block => {
    if (block.type === 'image' || block.type === 'divider') return '';
    return inlineToText(block.children || []);
  }).join(' ');
}

// ── Reading time ──────────────────────────────────────────────────────────────

function readingTime(content: any[] | string, lang: 'zh' | 'en') {
  const text = Array.isArray(content) ? blocksToPlainText(content) : (content || '');
  const cleaned = text.replace(/[#*>`\-\s]/g, '');
  return Math.max(1, Math.ceil(cleaned.length / (lang === 'zh' ? 300 : 800)));
}

// ── Controller ────────────────────────────────────────────────────────────────

export default {
  async translate(ctx: any) {
    const { documentId } = ctx.request.body as { documentId?: string };
    if (!documentId?.trim()) return ctx.badRequest('请提供 documentId');

    let zhDoc = await (strapi as any).documents('api::article.article').findOne({
      documentId, locale: ZH_LOCALE, status: 'draft',
    });
    if (!zhDoc) {
      zhDoc = await (strapi as any).documents('api::article.article').findOne({
        documentId, locale: ZH_LOCALE, status: 'published',
      });
    }
    if (!zhDoc) return ctx.notFound('未找到该文章的中文版本');

    const { title, excerpt } = zhDoc;
    if (!title) return ctx.badRequest('中文版本内容为空，请先填写标题');

    // Convert blocks → markdown for translation
    const contentMd = Array.isArray(zhDoc.content)
      ? blocksToMarkdown(zhDoc.content)
      : (zhDoc.content || '');

    try {
      const enUserPrompt = `Translate the following JSON content into professional English. Maintain the jewellery brand tone: minimalist, architectural, artistic. Keep the same Markdown structure in the content field.
IMPORTANT: Preserve all Markdown image syntax \`![alt](url)\` exactly as-is — do not translate, modify, or remove image URLs.

\`\`\`json
${JSON.stringify({ title, excerpt, content: contentMd }, null, 2)}
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
      const enBlocks = en.content ? markdownToBlocks(en.content) : null;
      const enSlug = zhDoc.slug ||
        (en.title as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      await (strapi as any).documents('api::article.article').update({
        documentId,
        data: {
          title: en.title,
          excerpt: en.excerpt ?? null,
          content: enBlocks,
          reading_time: enBlocks ? readingTime(enBlocks, 'en') : zhDoc.reading_time,
          slug: enSlug,
          ...(zhDoc.cover_image && { cover_image: zhDoc.cover_image.id }),
          ...(zhDoc.category && { category: zhDoc.category.id }),
        },
        locale: 'en',
        status: 'draft',
      });

      await (strapi as any).documents('api::article.article').publish({ documentId, locale: ZH_LOCALE });
      await (strapi as any).documents('api::article.article').publish({ documentId, locale: 'en' });

      ctx.body = { success: true, data: { documentId, zhTitle: title, enTitle: en.title } };
    } catch (error: any) {
      (strapi as any).log.error('AI 翻译失败:', error.message);
      return ctx.badRequest(error.message || 'AI 翻译失败，请重试');
    }
  },

  async format(ctx: any) {
    const { documentId } = ctx.request.body as { documentId?: string };
    if (!documentId?.trim()) return ctx.badRequest('请提供 documentId');

    let doc = await (strapi as any).documents('api::article.article').findOne({
      documentId, locale: ZH_LOCALE, status: 'draft',
    });
    if (!doc) {
      doc = await (strapi as any).documents('api::article.article').findOne({
        documentId, locale: ZH_LOCALE, status: 'published',
      });
    }
    if (!doc) return ctx.notFound('未找到该文章');
    if (!doc.content) return ctx.badRequest('文章内容为空');

    const contentMd = Array.isArray(doc.content)
      ? blocksToMarkdown(doc.content)
      : doc.content;

    try {
      const prompt = `你是专业的珠宝编辑平台内容编辑。对以下文章正文进行排版优化：

要求：
- 使用 ## 作为小节标题
- 重要观点或金句使用 > 引用块
- 段落简洁，段间自然分隔
- 适当位置使用 --- 分割线
- 保留所有图片语法 ![alt](url) 原样不变，不得删除或修改
- 不修改实际文字内容，只调整结构和格式

直接返回优化后的 Markdown 内容，不要有任何额外说明。

原文：
${contentMd}`;

      const raw = await callQwen([{ role: 'user', content: prompt }], 4000);
      const cleaned = raw.replace(/^```(?:markdown)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const formattedBlocks = markdownToBlocks(cleaned);

      await (strapi as any).documents('api::article.article').update({
        documentId,
        data: { content: formattedBlocks },
        locale: ZH_LOCALE,
        status: 'draft',
      });

      ctx.body = { success: true };
    } catch (error: any) {
      (strapi as any).log.error('AI 排版优化失败:', error.message);
      return ctx.badRequest(error.message || 'AI 优化失败，请重试');
    }
  },

  async generate(ctx: any) {
    const { prompt } = ctx.request.body as { prompt?: string };
    if (!prompt?.trim()) return ctx.badRequest('请提供文章描述');

    try {
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
      const zhBlocks = zh.content ? markdownToBlocks(zh.content) : null;

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
      const enBlocks = en.content ? markdownToBlocks(en.content) : null;

      const zhDoc = await (strapi as any).documents('api::article.article').create({
        data: {
          title: zh.title,
          excerpt: zh.excerpt,
          content: zhBlocks,
          reading_time: zhBlocks ? readingTime(zhBlocks, 'zh') : 5,
          published_date: new Date().toISOString(),
        },
        locale: ZH_LOCALE,
        status: 'draft',
      });

      await (strapi as any).documents('api::article.article').update({
        documentId: zhDoc.documentId,
        data: {
          title: en.title,
          excerpt: en.excerpt,
          content: enBlocks,
          reading_time: enBlocks ? readingTime(enBlocks, 'en') : 5,
        },
        locale: 'en',
        status: 'draft',
      });

      ctx.body = {
        success: true,
        data: { documentId: zhDoc.documentId, zhTitle: zh.title, enTitle: en.title },
      };
    } catch (error: any) {
      (strapi as any).log.error('AI 文章生成失败:', error.message);
      return ctx.badRequest(error.message || 'AI 生成失败，请重试');
    }
  },
};
