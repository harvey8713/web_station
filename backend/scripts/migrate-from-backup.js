/**
 * 从备份表迁移文章内容到 Blocks 格式
 *
 * 用法（在 ECS 服务器上）：
 *   STRAPI_URL=http://localhost:1337 \
 *   STRAPI_ADMIN_EMAIL=admin@example.com \
 *   STRAPI_ADMIN_PASSWORD=yourpassword \
 *   DB_NAME=strapi_db \
 *   DB_USER=strapi \
 *   DB_PASSWORD=yourdbpassword \
 *   node /root/web_station/backend/scripts/migrate-from-backup.js
 */

const axios = require('axios');
const { Client } = require('pg');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const EMAIL = process.env.STRAPI_ADMIN_EMAIL;
const PASSWORD = process.env.STRAPI_ADMIN_PASSWORD;

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'strapi_db',
  user: process.env.DB_USER || 'strapi',
  password: process.env.DB_PASSWORD,
};

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

  // 1. 连接数据库，读备份
  console.log('连接数据库...');
  const db = new Client(DB_CONFIG);
  await db.connect();

  const { rows } = await db.query(
    'SELECT document_id, locale, content_md FROM articles_content_backup WHERE content_md IS NOT NULL ORDER BY document_id, locale'
  );
  console.log(`备份表中共 ${rows.length} 条记录`);
  await db.end();

  if (rows.length === 0) {
    console.log('没有需要迁移的内容，退出');
    return;
  }

  // 2. 登录 Strapi
  console.log('\n登录 Strapi...');
  const loginRes = await axios.post(`${STRAPI_URL}/admin/login`, { email: EMAIL, password: PASSWORD });
  const token = loginRes.data.data.token;
  const headers = { Authorization: `Bearer ${token}` };
  console.log('登录成功');

  // 3. 逐条转换并更新
  let converted = 0, failed = 0;

  for (const row of rows) {
    const { document_id, locale, content_md } = row;
    try {
      const blocks = markdownToBlocks(content_md);
      await axios.put(
        `${STRAPI_URL}/api/articles/${document_id}`,
        { data: { content: blocks } },
        { headers, params: { locale } }
      );
      converted++;
      console.log(`  ✅ ${locale} / ${document_id}`);
    } catch (e) {
      failed++;
      const msg = e.response?.data?.error?.message || e.message;
      console.error(`  ❌ ${locale} / ${document_id} — ${msg}`);
    }
  }

  console.log(`\n完成！共 ${rows.length} 条，成功 ${converted}，失败 ${failed}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
