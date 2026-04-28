import React from 'react';

const c = {
  page: {
    padding: '48px 56px',
    maxWidth: '860px',
    fontFamily: "'Inter', -apple-system, sans-serif",
    color: '#32324d',
  } as React.CSSProperties,
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#181826',
    marginBottom: '6px',
  } as React.CSSProperties,
  pageSub: {
    fontSize: '14px',
    color: '#8e8ea0',
    marginBottom: '40px',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#8e8ea0',
    marginBottom: '16px',
    marginTop: '40px',
  },
  card: {
    background: '#fff',
    border: '1px solid #eaeaef',
    borderRadius: '8px',
    padding: '24px 28px',
    marginBottom: '12px',
  } as React.CSSProperties,
  stepRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid #f0f0f5',
  } as React.CSSProperties,
  stepRowLast: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '16px 0',
  } as React.CSSProperties,
  badge: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#4945ff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    flexShrink: 0,
    marginTop: '1px',
  } as React.CSSProperties,
  stepTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#181826',
    marginBottom: '4px',
  } as React.CSSProperties,
  stepDesc: {
    fontSize: '13px',
    color: '#666687',
    lineHeight: 1.6,
  } as React.CSSProperties,
  tag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    marginRight: '6px',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 14px',
    background: '#f6f6f9',
    borderBottom: '1px solid #eaeaef',
    fontWeight: 600,
    color: '#32324d',
    fontSize: '12px',
  },
  td: {
    padding: '10px 14px',
    borderBottom: '1px solid #f0f0f5',
    color: '#32324d',
    verticalAlign: 'top' as const,
  },
  warnCard: {
    background: '#fff4f4',
    border: '1px solid #fcc5c5',
    borderRadius: '8px',
    padding: '20px 24px',
    marginBottom: '12px',
  } as React.CSSProperties,
  warnTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#b72b1a',
    marginBottom: '10px',
  } as React.CSSProperties,
  warnItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    fontSize: '13px',
    color: '#c4380f',
    marginBottom: '6px',
    lineHeight: 1.5,
  } as React.CSSProperties,
  fieldCard: {
    background: '#f6f6f9',
    border: '1px solid #eaeaef',
    borderRadius: '6px',
    padding: '16px 20px',
    marginBottom: '8px',
  } as React.CSSProperties,
  fieldName: {
    fontFamily: 'monospace',
    fontSize: '12px',
    background: '#eaeaef',
    padding: '2px 6px',
    borderRadius: '3px',
    color: '#4945ff',
    marginRight: '8px',
  } as React.CSSProperties,
};

const Step = ({
  n, title, desc, tags,
}: {
  n: number; title: string; desc: React.ReactNode; tags?: { label: string; color: string }[];
}) => (
  <div style={n === 4 ? c.stepRowLast : c.stepRow}>
    <div style={c.badge}>{n}</div>
    <div>
      <div style={c.stepTitle}>
        {tags?.map((t) => (
          <span key={t.label} style={{ ...c.tag, background: t.color + '20', color: t.color }}>
            {t.label}
          </span>
        ))}
        {title}
      </div>
      <div style={c.stepDesc}>{desc}</div>
    </div>
  </div>
);

export default function QuickGuidePage() {
  return (
    <div style={c.page}>
      <h1 style={c.pageTitle}>快速上手指南</h1>
      <p style={c.pageSub}>Magician in Jewellery 内容管理后台 · 日常操作说明</p>

      {/* ── 日常发文流程 ── */}
      <div style={c.sectionTitle}>日常发文流程</div>
      <div style={c.card}>
        <Step
          n={1}
          title="AI 生成文章"
          tags={[{ label: '推荐', color: '#4945ff' }]}
          desc={
            <>
              点击左侧菜单「<strong>AI 生成文章</strong>」，输入文章方向描述，点击生成。AI
              会自动生成中英双语草稿（约 30–60 秒），并直接保存到内容管理器。
            </>
          }
        />
        <Step
          n={2}
          title="审核 & 补充封面图"
          desc={
            <>
              进入「<strong>Content Manager → Article</strong>
              」找到刚生成的草稿，审核文字内容，上传封面图（1200×900px，JPG），选择分类（Category）。
            </>
          }
        />
        <Step
          n={3}
          title="检查英文版"
          desc={
            <>
              在文章编辑页右上角切换 Locale 到 <strong>EN</strong>，检查英文翻译是否准确，可按需修改。
            </>
          }
        />
        <Step
          n={4}
          title="发布上线"
          desc={
            <>
              确认无误后，点击右上角 <strong>Publish</strong>
              按钮。中英两个 locale 需要分别 Publish。发布后前端页面即时生效。
            </>
          }
        />
      </div>

      {/* ── 图片规格 ── */}
      <div style={c.sectionTitle}>图片规格</div>
      <div style={c.card}>
        <table style={c.table}>
          <thead>
            <tr>
              <th style={c.th}>用途</th>
              <th style={c.th}>尺寸</th>
              <th style={c.th}>格式</th>
              <th style={c.th}>大小上限</th>
              <th style={c.th}>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={c.td}><strong>文章封面图</strong></td>
              <td style={c.td}>1200 × 900 px</td>
              <td style={c.td}>JPG</td>
              <td style={c.td}>500 KB</td>
              <td style={c.td}>首页卡片 4:3 裁切，文章详情页全宽展示</td>
            </tr>
            <tr>
              <td style={c.td}><strong>首页 Intro 背景图</strong></td>
              <td style={c.td}>1200 × 800 px</td>
              <td style={c.td}>JPG</td>
              <td style={c.td}>400 KB</td>
              <td style={c.td}>左半屏展示，建议竖向构图、暗色调</td>
            </tr>
            <tr>
              <td style={c.td}>Banner 背景图</td>
              <td style={c.td}>1920 × 600 px</td>
              <td style={c.td}>JPG</td>
              <td style={c.td}>600 KB</td>
              <td style={c.td}>全宽横向展示，如用到 Banner 区块时</td>
            </tr>
          </tbody>
        </table>
        <p style={{ ...c.stepDesc, marginTop: '14px' }}>
          💡 上传图片前可用{' '}
          <a href="https://squoosh.app" target="_blank" rel="noreferrer" style={{ color: '#4945ff' }}>
            Squoosh
          </a>{' '}
          免费压缩，不影响画质的情况下缩小文件体积。
        </p>
      </div>

      {/* ── 文章字段说明 ── */}
      <div style={c.sectionTitle}>Article 字段说明</div>
      <div style={c.card}>
        {[
          ['title', '文章标题，15–30 字，显示在卡片和详情页顶部'],
          ['slug', 'URL 路径，根据标题自动生成，不需要手动填'],
          ['excerpt', '摘要，80 字以内，显示在首页文章卡片上'],
          ['content', '正文，Markdown 格式，支持 ## 标题、引用、加粗等'],
          ['cover_image', '封面图，从 Media Library 选或直接上传'],
          ['category', '分类，选择 Forecast / Profiles / Culture 等'],
          ['reading_time', '阅读时长（分钟），AI 生成时自动计算，也可手动改'],
        ].map(([field, desc]) => (
          <div key={field} style={c.fieldCard}>
            <span style={c.fieldName}>{field}</span>
            <span style={{ fontSize: '13px', color: '#666687' }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* ── 首页内容管理 ── */}
      <div style={c.sectionTitle}>首页内容在哪里改</div>
      <div style={c.card}>
        <p style={{ ...c.stepDesc, marginBottom: '12px' }}>
          打开 <strong>Content Manager → Homepage</strong>，可以修改每个区块的文字内容：
        </p>
        {[
          ['Hero', '大标题、副标题、按钮文字'],
          ['Intro', '关于平台的描述文字、背景图链接'],
          ['Article Grid', '「Latest Insights」这行标题文字、文章数量'],
          ['Contact Band', '联系方式：邮箱、Instagram、微信'],
        ].map(([section, desc]) => (
          <div
            key={section}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '10px 0',
              borderBottom: '1px solid #f0f0f5',
              fontSize: '13px',
            }}
          >
            <span
              style={{
                minWidth: '100px',
                fontWeight: 600,
                color: '#4945ff',
              }}
            >
              {section}
            </span>
            <span style={{ color: '#666687' }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* ── 危险区域 ── */}
      <div style={{ ...c.sectionTitle, color: '#b72b1a' }}>请勿操作（除非你知道在做什么）</div>
      <div style={c.warnCard}>
        <div style={c.warnTitle}>以下操作可能导致前端页面崩溃或数据丢失：</div>
        {[
          ['Content-Type Builder', '这是数据库结构配置，修改字段会破坏现有数据'],
          ['Settings → Roles', '权限配置已设置好，随意改动会导致 API 无法访问'],
          ['Settings → Internationalization', '语言设置不要删除已有的 zh / en locale'],
          ['插件设置', 'ai-content-generator 插件已被新方案替代，不要重新启用'],
        ].map(([item, desc]) => (
          <div key={item} style={c.warnItem}>
            <span style={{ color: '#b72b1a', fontWeight: 700, flexShrink: 0 }}>✕</span>
            <span>
              <strong>{item}</strong>：{desc}
            </span>
          </div>
        ))}
      </div>

      <p style={{ ...c.stepDesc, marginTop: '32px', fontSize: '12px' }}>
        如有疑问或需要新功能，联系开发者即可。
      </p>
    </div>
  );
}
