import React, { useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { useParams } from 'react-router-dom';

const s: Record<string, React.CSSProperties> = {
  btn: {
    width: '100%',
    padding: '10px 16px',
    background: '#4945ff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'opacity 0.2s',
    boxSizing: 'border-box' as const,
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  success: {
    marginTop: '10px',
    padding: '10px 12px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#166534',
    lineHeight: 1.5,
  },
  error: {
    marginTop: '10px',
    padding: '10px 12px',
    background: '#fcecea',
    border: '1px solid #f5c6c2',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#b72b1a',
    lineHeight: 1.5,
  },
  hint: {
    marginTop: '8px',
    fontSize: '11px',
    color: '#a5a5ba',
    lineHeight: 1.5,
  },
};

// Inner component — owns all state and hooks, renders JSX normally
function TranslatePanelContent({ documentId }: { documentId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ zhTitle: string; enTitle: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { post } = useFetchClient();

  const handleTranslate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await post('/api/ai-translate', { documentId });
      const body = response.data as any;
      if (body?.success && body?.data) {
        setResult(body.data);
      } else {
        throw new Error('翻译失败，请重试');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        '翻译失败，请检查 QWEN_API_KEY 配置';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
        onClick={handleTranslate}
        disabled={loading}
      >
        {loading ? '⏳ 翻译中（约30秒）…' : '🌐 翻译并发布双语'}
      </button>
      <p style={s.hint}>将中文内容翻译为英文，同时发布中英文两个版本。</p>
      {result && (
        <div style={s.success}>
          ✅ 发布成功
          <br />
          中文：{result.zhTitle}
          <br />
          English: {result.enTitle}
        </div>
      )}
      {error && <div style={s.error}>❌ {error}</div>}
    </div>
  );
}

// DescriptionComponent: called as a React component by Strapi, must return
// { title, content } (an object), not JSX. Hooks are allowed here.
export default function TranslatePanel() {
  const { id: documentId } = useParams<{ id: string }>();

  // Returning null tells Strapi not to render this panel
  if (!documentId || documentId === 'create') return null;

  return {
    title: 'AI 翻译',
    content: <TranslatePanelContent documentId={documentId} />,
  } as any;
}
