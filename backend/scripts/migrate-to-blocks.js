/**
 * 迁移脚本：将历史 Markdown 文章内容转换为 Strapi Blocks 格式
 *
 * 用法（在 ECS 服务器上）：
 *   STRAPI_URL=http://localhost:1337 \
 *   STRAPI_ADMIN_EMAIL=admin@example.com \
 *   STRAPI_ADMIN_PASSWORD=yourpassword \
 *   node backend/scripts/migrate-to-blocks.js
 */

const axios = require('axios');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const EMAIL = process.env.STRAPI_ADMIN_EMAIL;
const PASSWORD = process.env.STRAPI_ADMIN_PASSWORD;
const ZH_LOCALE = process.env.ZH_LOCALE || 'zh-CN';

// ── Markdown → Blocks ─────────────────────────────────────────────────────────

function parseInline(text) {
  const children = [];
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

function markdownToBlocks(md) {
  if (!md || !md.trim()) return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
  const blocks = [];
  const lines = md.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

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
    if (/^[-*_]{3,}$/.test(line.trim())) {
      blocks.push({ type: 'divider', children: [{ type: 'text', text: '' }] });
      i++; continue;
    }
    if (line.startsWith('> ')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('> ')) { quoteLines.push(lines[i].slice(2)); i++; }
      blocks.push({ type: 'quote', children: parseInline(quoteLines.join(' ')) });
      continue;
    }
    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      blocks.push({
        type: 'image',
        image: { url: imgMatch[2], alternativeText: imgMatch[1] || '' },
        children: [{ type: 'text', text: imgMatch[1] || '' }],
      });
      i++; continue;
    }
    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push({ type: 'list-item', children: parseInline(lines[i].slice(2)) }); i++;
      }
      blocks.push({ type: 'list', format: 'unordered', children: items });
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push({ type: 'list-item', children: parseInline(lines[i].replace(/^\d+\. /, '')) }); i++;
      }
      blocks.push({ type: 'list', format: 'ordered', children: items });
      continue;
    }
    const paraLines = [];
    while (
      i < lines.length && lines[i].trim() &&
      !/^#{1,3} /.test(lines[i]) && !lines[i].startsWith('> ') &&
      !/^[-*] /.test(lines[i]) && !/^\d+\. /.test(lines[i]) &&
      !/^[-*_]{3,}$/.test(lines[i].trim()) && !/^!\[/.test(lines[i].trim())
    ) { paraLines.push(lines[i]); i++; }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', children: parseInline(paraLines.join(' ')) });
    }
  }
  return blocks.length > 0 ? blocks : [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error('需要设置 STRAPI_ADMIN_EMAIL 和 STRAPI_ADMIN_PASSWORD 环境变量');
    process.exit(1);
  }

  // 1. 登录获取 JWT
  console.log('正在登录 Strapi...');
  const loginRes = await axios.post(`${STRAPI_URL}/admin/login`, { email: EMAIL, password: PASSWORD });
  const token = loginRes.data.data.token;
  const headers = { Authorization: `Bearer ${token}` };
  console.log('登录成功');

  const locales = [ZH_LOCALE, 'en'];
  let total = 0, converted = 0, skipped = 0;

  for (const locale of locales) {
    console.log(`\n处理 locale: ${locale}`);
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const res = await axios.get(`${STRAPI_URL}/api/articles`, {
        headers,
        params: {
          locale,
          'pagination[page]': page,
          'pagination[pageSize]': 25,
          'populate': 'category,cover_image',
          status: 'draft',
        },
      });

      const articles = res.data.data || [];
      const pagination = res.data.meta?.pagination;
      hasMore = pagination ? page < pagination.pageCount : false;
      page++;

      for (const article of articles) {
        total++;
        const { documentId } = article;
        const content = article.content;

        // 已经是 blocks 格式（数组）则跳过
        if (Array.isArray(content)) {
          skipped++;
          console.log(`  跳过 (已是 blocks): ${article.title}`);
          continue;
        }

        // 没有内容跳过
        if (!content) {
          skipped++;
          console.log(`  跳过 (无内容): ${article.title}`);
          continue;
        }

        try {
          const blocks = markdownToBlocks(content);
          await axios.put(
            `${STRAPI_URL}/api/articles/${documentId}`,
            { data: { content: blocks } },
            { headers, params: { locale } }
          );
          converted++;
          console.log(`  ✅ 转换: ${article.title}`);
        } catch (e) {
          console.error(`  ❌ 失败: ${article.title} —`, e.message);
        }
      }
    }
  }

  console.log(`\n完成！共 ${total} 篇，转换 ${converted} 篇，跳过 ${skipped} 篇`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
