import React, { useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';

const s: Record<string, React.CSSProperties> = {
  wrap: {
    padding: '48px 56px',
    maxWidth: '760px',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  heading: {
    fontSize: '26px',
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: '6px',
  },
  sub: {
    fontSize: '14px',
    color: '#8e8ea0',
    marginBottom: '36px',
    lineHeight: 1.6,
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: '#32324d',
    marginBottom: '10px',
  },
  textarea: {
    width: '100%',
    minHeight: '160px',
    padding: '14px 16px',
    border: '1px solid #dcdce4',
    borderRadius: '4px',
    fontSize: '14px',
    lineHeight: '1.7',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    color: '#32324d',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  hint: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#a5a5ba',
    lineHeight: 1.6,
  },
  btn: {
    marginTop: '20px',
    padding: '10px 24px',
    background: '#4945ff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'opacity 0.2s',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  error: {
    marginTop: '20px',
    padding: '14px 18px',
    background: '#fcecea',
    border: '1px solid #f5c6c2',
    borderRadius: '4px',
    color: '#b72b1a',
    fontSize: '14px',
  },
  card: {
    marginTop: '28px',
    padding: '24px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#166534',
    marginBottom: '16px',
  },
  link: {
    display: 'block',
    padding: '12px 16px',
    marginBottom: '10px',
    background: '#fff',
    border: '1px solid #d1fae5',
    borderRadius: '4px',
    color: '#15803d',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'background 0.15s',
  },
  cardHint: {
    marginTop: '12px',
    fontSize: '12px',
    color: '#4ade80',
  },
};

interface Result {
  documentId: string;
  zhTitle: string;
  enTitle: string;
}

export default function AIGeneratePage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const { post } = useFetchClient();

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await post('/api/ai-generate', { prompt: prompt.trim() });
      const body = response.data as any;

      if (body?.success && body?.data) {
        setResult(body.data);
        setPrompt('');
      } else {
        throw new Error('生成失败，请重试');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        '生成失败，请检查网络或 API Key';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const base = '/admin/content-manager/collection-types/api::article.article';

  return (
    <div style={s.wrap}>
      <h1 style={s.heading}>✨ AI 文章生成</h1>
      <p style={s.sub}>
        描述你想要的文章方向，AI 将自动生成中英双语草稿并保存到内容管理器。
        <br />
        生成完成后，在内容管理器中审核并发布。
      </p>

      <label style={s.label}>描述文章方向</label>
      <textarea
        style={s.textarea}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={
          '可以是任何方向的自然语言描述，例如：\n\n' +
          '分析 Cartier 如何通过设计语言传达法式优雅，以及其百年历史对品牌叙事的影响\n\n' +
          '或：探讨独立珠宝设计师如何用极简主义重新定义当代高端珠宝的价值体系'
        }
        disabled={loading}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate();
        }}
      />
      <p style={s.hint}>
        💡 不限于标题或关键词，可以是主题、角度、参考案例等任意描述。
        按 Ctrl+Enter 快速生成。
      </p>

      <button
        style={{
          ...s.btn,
          ...(loading || !prompt.trim() ? s.btnDisabled : {}),
        }}
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
      >
        {loading ? '⏳ 生成中（约30–60秒）…' : '✨ 生成文章'}
      </button>

      {error && <div style={s.error}>❌ {error}</div>}

      {result && (
        <div style={s.card}>
          <div style={s.cardTitle}>✅ 文章已生成，已保存为草稿</div>
          <a
            href={`${base}/${result.documentId}?locale=zh`}
            style={s.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 中文草稿：{result.zhTitle}
          </a>
          <a
            href={`${base}/${result.documentId}?locale=en`}
            style={s.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 English draft: {result.enTitle}
          </a>
          <p style={s.cardHint}>
            点击链接进入编辑页，审核内容后点击 Publish 发布上线。
          </p>
        </div>
      )}
    </div>
  );
}
