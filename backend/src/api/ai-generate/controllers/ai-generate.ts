import axios from 'axios';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

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

// ── Markdown ↔ HTML 互转 ──────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineToHtml(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function markdownToHtml(md: string): string {
  if (!md?.trim()) return '';
  const lines = md.split('\n');
  let html = '';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith('### ')) {
      html += `<h3>${inlineToHtml(line.slice(4).trim())}</h3>\n`;
      i++; continue;
    }
    if (line.startsWith('## ')) {
      html += `<h2>${inlineToHtml(line.slice(3).trim())}</h2>\n`;
      i++; continue;
    }
    if (line.startsWith('# ')) {
      html += `<h1>${inlineToHtml(line.slice(2).trim())}</h1>\n`;
      i++; continue;
    }
    if (/^[-*_]{3,}$/.test(line.trim())) {
      html += '<hr/>\n';
      i++; continue;
    }
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      html += `<blockquote><p>${inlineToHtml(quoteLines.join(' '))}</p></blockquote>\n`;
      continue;
    }
    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      html += `<figure class="image"><img src="${imgMatch[2]}" alt="${escapeHtml(imgMatch[1])}"/></figure>\n`;
      i++; continue;
    }
    if (/^[-*] /.test(line)) {
      html += '<ul>\n';
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        html += `<li>${inlineToHtml(lines[i].slice(2))}</li>\n`;
        i++;
      }
      html += '</ul>\n';
      continue;
    }
    if (/^\d+\. /.test(line)) {
      html += '<ol>\n';
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        html += `<li>${inlineToHtml(lines[i].replace(/^\d+\. /, ''))}</li>\n`;
        i++;
      }
      html += '</ol>\n';
      continue;
    }
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
      html += `<p>${inlineToHtml(paraLines.join(' '))}</p>\n`;
    }
  }

  return html.trim();
}

function stripInlineTags(html: string): string {
  return html
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    .replace(/<[^>]+>/g, '');
}

function htmlToMarkdown(html: string): string {
  if (!html) return '';
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, (_, c) => `# ${stripInlineTags(c)}\n\n`)
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, (_, c) => `## ${stripInlineTags(c)}\n\n`)
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, (_, c) => `### ${stripInlineTags(c)}\n\n`)
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) => `> ${stripInlineTags(c).trim()}\n\n`)
    .replace(/<hr\s*\/?>/gi, '---\n\n')
    .replace(/<figure[^>]*>\s*<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>\s*(?:<figcaption>([\s\S]*?)<\/figcaption>\s*)?<\/figure>/gi,
      (_, url, alt) => `![${alt}](${url})\n\n`)
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, c) =>
      c.replace(/<li[^>]*>(.*?)<\/li>/gi, (_: string, item: string) => `- ${stripInlineTags(item)}\n`) + '\n')
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, c) => {
      let n = 0;
      return c.replace(/<li[^>]*>(.*?)<\/li>/gi, (_: string, item: string) => `${++n}. ${stripInlineTags(item)}\n`) + '\n';
    })
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, c) => `${stripInlineTags(c)}\n\n`)
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function htmlToPlainText(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Reading time ──────────────────────────────────────────────────────────────

function readingTime(content: string, lang: 'zh' | 'en') {
  const text = htmlToPlainText(content || '');
  const cleaned = text.replace(/\s/g, '');
  return Math.max(1, Math.ceil(cleaned.length / (lang === 'zh' ? 300 : 800)));
}

// ── Controller ────────────────────────────────────────────────────────────────

const AGENT_TOKEN = process.env.AGENT_UPLOAD_TOKEN || '';

function checkAgentToken(ctx: any): boolean {
  const token = ctx.request.body?.token || ctx.request.headers['x-agent-token'];
  if (!AGENT_TOKEN) {
    (strapi as any).log.warn('[agent-upload] AGENT_UPLOAD_TOKEN not set');
    return false;
  }
  return token === AGENT_TOKEN;
}

// blocks[] → HTML string，固定格式规范
function blocksToHtml(blocks: Array<{ type: string; text?: string; image_id?: number; image_url?: string }>): string {
  let html = '';
  for (const block of blocks) {
    switch (block.type) {
      case 'image': {
        const src = block.image_url || '';
        if (src) {
          html += `<figure class="image image_resized" style="width:75%;"><img src="${src}" alt=""/></figure>`;
        }
        break;
      }
      case 'caption':
        html += `<p style="text-align:center;"><i><strong>${block.text || ''}</strong></i></p>`;
        break;
      case 'h2':
        html += `<h2>${block.text || ''}</h2>`;
        break;
      case 'blockquote':
        html += `<blockquote><p>${block.text || ''}</p></blockquote>`;
        break;
      case 'paragraph':
      default:
        if (block.text?.trim()) {
          html += `<p>${block.text}</p>`;
        }
        break;
    }
  }
  return html;
}

export default {
  async translate(ctx: any) {
    const { documentId, sourceLocale } = ctx.request.body as { documentId?: string; sourceLocale?: string };
    if (!documentId?.trim()) return ctx.badRequest('请提供 documentId');

    const isEnToZh = sourceLocale === 'en';

    if (isEnToZh) {
      // ── en → zh ──────────────────────────────────────────────────────────────
      let enDoc = await (strapi as any).documents('api::article.article').findOne({
        documentId, locale: 'en', status: 'draft',
      });
      if (!enDoc) {
        enDoc = await (strapi as any).documents('api::article.article').findOne({
          documentId, locale: 'en', status: 'published',
        });
      }
      if (!enDoc) return ctx.notFound('未找到该文章的英文版本');
      if (!enDoc.title) return ctx.badRequest('英文版本内容为空，请先填写标题');

      const contentMd = htmlToMarkdown(enDoc.content || '');

      try {
        const zhPrompt = `将以下 JSON 内容翻译成专业中文。保持珠宝品牌调性：极简、建筑美学、艺术性。content 字段保持相同的 Markdown 结构。
重要：所有 Markdown 图片语法 \`![alt](url)\` 原样保留，不得翻译或修改图片 URL。

\`\`\`json
${JSON.stringify({ title: enDoc.title, excerpt: enDoc.excerpt, content: contentMd }, null, 2)}
\`\`\`

严格按照以下 JSON 格式输出：
\`\`\`json
{
  "title": "中文标题",
  "excerpt": "中文摘要（可为 null）",
  "content": "中文正文，Markdown 格式（可为 null）"
}
\`\`\``;

        const zhRaw = await callQwen([{ role: 'user', content: zhPrompt }]);
        const zh = extractJson(zhRaw);
        const zhHtml = zh.content ? markdownToHtml(zh.content) : null;

        await (strapi as any).documents('api::article.article').update({
          documentId,
          data: {
            title: zh.title,
            excerpt: zh.excerpt ?? null,
            content: zhHtml,
            reading_time: zhHtml ? readingTime(zhHtml, 'zh') : enDoc.reading_time,
            ...(enDoc.cover_image && { cover_image: enDoc.cover_image.id }),
            ...(enDoc.category && { category: enDoc.category.id }),
          },
          locale: ZH_LOCALE,
          status: 'draft',
        });

        ctx.body = { success: true, data: { documentId, enTitle: enDoc.title, zhTitle: zh.title } };
      } catch (error: any) {
        (strapi as any).log.error('AI 翻译失败:', error.message);
        return ctx.badRequest(error.message || 'AI 翻译失败，请重试');
      }
    } else {
      // ── zh → en ──────────────────────────────────────────────────────────────
      let zhDoc = await (strapi as any).documents('api::article.article').findOne({
        documentId, locale: ZH_LOCALE, status: 'draft',
      });
      if (!zhDoc) {
        zhDoc = await (strapi as any).documents('api::article.article').findOne({
          documentId, locale: ZH_LOCALE, status: 'published',
        });
      }
      if (!zhDoc) return ctx.notFound('未找到该文章的中文版本');
      if (!zhDoc.title) return ctx.badRequest('中文版本内容为空，请先填写标题');

      const contentMd = htmlToMarkdown(zhDoc.content || '');

      try {
        const enPrompt = `Translate the following JSON content into professional English. Maintain the jewellery brand tone: minimalist, architectural, artistic. Keep the same Markdown structure in the content field.
IMPORTANT: Preserve all Markdown image syntax \`![alt](url)\` exactly as-is — do not translate, modify, or remove image URLs.

\`\`\`json
${JSON.stringify({ title: zhDoc.title, excerpt: zhDoc.excerpt, content: contentMd }, null, 2)}
\`\`\`

Output strictly in JSON format:
\`\`\`json
{
  "title": "English title",
  "excerpt": "English excerpt (may be null if original is null)",
  "content": "English content in Markdown (may be null if original is null)"
}
\`\`\``;

        const enRaw = await callQwen([{ role: 'user', content: enPrompt }]);
        const en = extractJson(enRaw);
        const enHtml = en.content ? markdownToHtml(en.content) : null;
        const enSlug = (zhDoc.slug && /^[a-z0-9-]+$/.test(zhDoc.slug))
          ? zhDoc.slug
          : `article-${Date.now()}`;

        await (strapi as any).documents('api::article.article').update({
          documentId,
          data: {
            title: en.title,
            excerpt: en.excerpt ?? null,
            content: enHtml,
            reading_time: enHtml ? readingTime(enHtml, 'en') : zhDoc.reading_time,
            slug: enSlug,
            ...(zhDoc.cover_image && { cover_image: zhDoc.cover_image.id }),
            ...(zhDoc.category && { category: zhDoc.category.id }),
          },
          locale: 'en',
          status: 'draft',
        });

        ctx.body = { success: true, data: { documentId, zhTitle: zhDoc.title, enTitle: en.title } };
      } catch (error: any) {
        (strapi as any).log.error('AI 翻译失败:', error.message);
        return ctx.badRequest(error.message || 'AI 翻译失败，请重试');
      }
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

    const contentMd = htmlToMarkdown(doc.content);

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
      const formattedHtml = markdownToHtml(cleaned);

      await (strapi as any).documents('api::article.article').update({
        documentId,
        data: { content: formattedHtml },
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
      const zhHtml = zh.content ? markdownToHtml(zh.content) : null;

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
      const enHtml = en.content ? markdownToHtml(en.content) : null;

      const zhDoc = await (strapi as any).documents('api::article.article').create({
        data: {
          title: zh.title,
          excerpt: zh.excerpt,
          content: zhHtml,
          reading_time: zhHtml ? readingTime(zhHtml, 'zh') : 5,
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
          content: enHtml,
          reading_time: enHtml ? readingTime(enHtml, 'en') : 5,
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

  // ── Agent: 上传单张图片（multipart 或 base64） ───────────────────────────────
  async agentUploadImage(ctx: any) {
    const token = ctx.request.body?.token || ctx.request.headers['x-agent-token'];
    if (!AGENT_TOKEN || token !== AGENT_TOKEN) return ctx.unauthorized('无效的 token');

    const tmpPath = path.join(os.tmpdir(), `agent-upload-${Date.now()}.tmp`);
    try {
      let name: string;
      let mime: string;

      const multipartFile = ctx.request.files?.file;
      if (multipartFile) {
        // multipart/form-data：koa-body 已写好临时文件，直接复制路径
        name = multipartFile.originalFilename || multipartFile.name || `upload-${Date.now()}.png`;
        mime = multipartFile.mimetype || multipartFile.type || 'image/png';
        fs.copyFileSync(multipartFile.filepath, tmpPath);
      } else {
        // JSON base64
        const { base64, filename, mimetype } = ctx.request.body as {
          base64?: string; filename?: string; mimetype?: string;
        };
        if (!base64) return ctx.badRequest('缺少文件：请用 multipart/form-data 上传 file 字段，或 JSON 提供 base64 字段');
        const buffer = Buffer.from(base64, 'base64');
        fs.writeFileSync(tmpPath, buffer);
        name = filename || `upload-${Date.now()}.png`;
        mime = mimetype || 'image/png';
      }

      const stat = fs.statSync(tmpPath);
      const uploadService = (strapi as any).plugin('upload').service('upload');
      const result = await uploadService.upload({
        data: { fileInfo: { name, caption: '', alternativeText: '' } },
        files: {
          name,
          type: mime,
          size: stat.size / 1024,
          filepath: tmpPath,
        },
      });

      const uploadedFile = Array.isArray(result) ? result[0] : result;
      ctx.body = { success: true, id: uploadedFile.id, url: uploadedFile.url };
    } catch (error: any) {
      (strapi as any).log.error('[agent-upload-image] 失败:', error.message, error.stack);
      return ctx.badRequest(error.message || '图片上传失败');
    } finally {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }
  },

  // ── Agent: 上传完整文章（blocks + 双语草稿） ──────────────────────────────────
  async agentUpload(ctx: any) {
    if (!checkAgentToken(ctx)) return ctx.unauthorized('无效的 token');

    const {
      title,
      excerpt,
      category_slug,
      cover_image_id,
      documentId,
      locale = 'en',
      blocks = [],
      skip_translate,
    } = ctx.request.body as {
      title?: string;
      excerpt?: string;
      category_slug?: string;
      cover_image_id?: number;
      documentId?: string;
      locale?: string;
      blocks?: Array<{ type: string; text?: string; image_id?: number; image_url?: string }>;
      skip_translate?: boolean;
    };

    if (!title?.trim()) return ctx.badRequest('缺少 title');
    if (!blocks.length) return ctx.badRequest('缺少 blocks');

    try {
      // 把 image_id 解析成 url（从 Strapi 媒体库查）
      const imageIds = blocks.filter(b => b.type === 'image' && b.image_id).map(b => b.image_id!);
      const idToUrl: Record<number, string> = {};
      if (imageIds.length) {
        const files = await (strapi as any).entityService.findMany('plugin::upload.file', {
          filters: { id: { $in: imageIds } },
          fields: ['id', 'url'],
        });
        for (const f of files) idToUrl[f.id] = f.url;
      }

      // 补全 blocks 里的 image_url
      const resolvedBlocks = blocks.map(b => {
        if (b.type === 'image' && b.image_id && idToUrl[b.image_id]) {
          return { ...b, image_url: idToUrl[b.image_id] };
        }
        return b;
      });

      const html = blocksToHtml(resolvedBlocks);
      const sourceLang = locale === 'en' ? 'en' : 'zh';

      // 查分类
      let categoryId: number | undefined;
      if (category_slug) {
        const cats = await (strapi as any).entityService.findMany('api::category.category', {
          filters: { slug: category_slug },
          fields: ['id'],
        });
        if (cats?.[0]) categoryId = cats[0].id;
      }

      const baseData: any = {
        title,
        excerpt: excerpt || null,
        content: html,
        reading_time: readingTime(html, sourceLang === 'zh' ? 'zh' : 'en'),
        published_date: new Date().toISOString(),
        ...(cover_image_id && { cover_image: cover_image_id }),
        ...(categoryId && { category: categoryId }),
      };

      const sourceLocale = sourceLang === 'zh' ? ZH_LOCALE : 'en';

      if (documentId) {
        // ── 更新已有草稿 ──
        await (strapi as any).documents('api::article.article').update({
          documentId,
          data: baseData,
          locale: sourceLocale,
          status: 'draft',
        });

        // 同步更新另一语言的封面图和分类
        const targetLocale = sourceLocale === 'en' ? ZH_LOCALE : 'en';
        await (strapi as any).documents('api::article.article').update({
          documentId,
          data: {
            ...(cover_image_id && { cover_image: cover_image_id }),
            ...(categoryId && { category: categoryId }),
          },
          locale: targetLocale,
          status: 'draft',
        });

        // AI 重新翻译另一语言
        let translatedTitle = '';
        if (!skip_translate) {
          const contentMd = htmlToMarkdown(html);
          if (sourceLang === 'zh') {
            const enRaw = await callQwen([{ role: 'user', content: `Translate the following JSON content into professional English. Maintain the jewellery brand tone: minimalist, architectural, artistic. Keep the same Markdown structure.\nIMPORTANT: Preserve all Markdown image syntax \\`![alt](url)\\` exactly as-is.\n\n\`\`\`json\n${JSON.stringify({ title, excerpt: excerpt || null, content: contentMd }, null, 2)}\n\`\`\`\n\nOutput strictly in JSON format:\n\`\`\`json\n{"title":"English title","excerpt":"English excerpt","content":"English content in Markdown"}\n\`\`\`` }]);
            const en = extractJson(enRaw);
            const enHtml = en.content ? markdownToHtml(en.content) : null;
            translatedTitle = en.title;
            await (strapi as any).documents('api::article.article').update({
              documentId, locale: 'en', status: 'draft',
              data: { title: en.title, excerpt: en.excerpt ?? null, content: enHtml, reading_time: enHtml ? readingTime(enHtml, 'en') : 5 },
            });
          } else {
            const zhRaw = await callQwen([{ role: 'user', content: `将以下 JSON 内容翻译成专业中文。保持珠宝品牌调性：极简、建筑美学、艺术性。content 字段保持相同的 Markdown 结构。\n重要：所有 Markdown 图片语法 \\`![alt](url)\\` 原样保留，不得翻译或修改图片 URL。\n\n\`\`\`json\n${JSON.stringify({ title, excerpt: excerpt || null, content: contentMd }, null, 2)}\n\`\`\`\n\n严格按照以下 JSON 格式输出：\n\`\`\`json\n{"title":"中文标题","excerpt":"中文摘要","content":"中文正文 Markdown"}\n\`\`\`` }]);
            const zh = extractJson(zhRaw);
            const zhHtml = zh.content ? markdownToHtml(zh.content) : null;
            translatedTitle = zh.title;
            await (strapi as any).documents('api::article.article').update({
              documentId, locale: ZH_LOCALE, status: 'draft',
              data: { title: zh.title, excerpt: zh.excerpt ?? null, content: zhHtml, reading_time: zhHtml ? readingTime(zhHtml, 'zh') : 5 },
            });
          }
        }

        ctx.body = {
          success: true,
          data: {
            documentId,
            sourceTitle: title,
            translatedTitle,
            adminUrl: `${process.env.PUBLIC_ADMIN_URL || 'http://47.242.252.133:1337'}/admin/content-manager/collection-types/api::article.article/${documentId}`,
            updated: true,
          },
        };
      } else {
        // ── 新建草稿 ──
        const created = await (strapi as any).documents('api::article.article').create({
          data: baseData,
          locale: sourceLocale,
          status: 'draft',
        });
        const newDocumentId = created.documentId;

        let translatedTitle = '';
        if (!skip_translate) {
          const contentMd = htmlToMarkdown(html);
          if (sourceLang === 'zh') {
            const enRaw = await callQwen([{ role: 'user', content: `Translate the following JSON content into professional English. Maintain the jewellery brand tone: minimalist, architectural, artistic. Keep the same Markdown structure.\nIMPORTANT: Preserve all Markdown image syntax \\`![alt](url)\\` exactly as-is.\n\n\`\`\`json\n${JSON.stringify({ title, excerpt: excerpt || null, content: contentMd }, null, 2)}\n\`\`\`\n\nOutput strictly in JSON format:\n\`\`\`json\n{"title":"English title","excerpt":"English excerpt","content":"English content in Markdown"}\n\`\`\`` }]);
            const en = extractJson(enRaw);
            const enHtml = en.content ? markdownToHtml(en.content) : null;
            translatedTitle = en.title;
            await (strapi as any).documents('api::article.article').update({
              documentId: newDocumentId, locale: 'en', status: 'draft',
              data: { title: en.title, excerpt: en.excerpt ?? null, content: enHtml, reading_time: enHtml ? readingTime(enHtml, 'en') : 5, ...(cover_image_id && { cover_image: cover_image_id }), ...(categoryId && { category: categoryId }) },
            });
          } else {
            const zhRaw = await callQwen([{ role: 'user', content: `将以下 JSON 内容翻译成专业中文。保持珠宝品牌调性：极简、建筑美学、艺术性。content 字段保持相同的 Markdown 结构。\n重要：所有 Markdown 图片语法 \\`![alt](url)\\` 原样保留，不得翻译或修改图片 URL。\n\n\`\`\`json\n${JSON.stringify({ title, excerpt: excerpt || null, content: contentMd }, null, 2)}\n\`\`\`\n\n严格按照以下 JSON 格式输出：\n\`\`\`json\n{"title":"中文标题","excerpt":"中文摘要","content":"中文正文 Markdown"}\n\`\`\`` }]);
            const zh = extractJson(zhRaw);
            const zhHtml = zh.content ? markdownToHtml(zh.content) : null;
            translatedTitle = zh.title;
            await (strapi as any).documents('api::article.article').update({
              documentId: newDocumentId, locale: ZH_LOCALE, status: 'draft',
              data: { title: zh.title, excerpt: zh.excerpt ?? null, content: zhHtml, reading_time: zhHtml ? readingTime(zhHtml, 'zh') : 5, ...(cover_image_id && { cover_image: cover_image_id }), ...(categoryId && { category: categoryId }) },
            });
          }
        }

        ctx.body = {
          success: true,
          data: {
            documentId: newDocumentId,
            sourceTitle: title,
            translatedTitle,
            adminUrl: `${process.env.PUBLIC_ADMIN_URL || 'http://47.242.252.133:1337'}/admin/content-manager/collection-types/api::article.article/${newDocumentId}`,
            updated: false,
          },
        };
      }
    } catch (error: any) {
      (strapi as any).log.error('[agent-upload] 失败:', error.message);
      return ctx.badRequest(error.message || '上传失败，请重试');
    }
  },
};
