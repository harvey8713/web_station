import React, { useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';

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
    marginBottom: '8px',
  },
  btnSecondary: {
    background: '#f0f0ff',
    color: '#4945ff',
    border: '1px solid #c0bfff',
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
    marginTop: '4px',
    marginBottom: '12px',
    fontSize: '11px',
    color: '#a5a5ba',
    lineHeight: 1.5,
  },
  notice: {
    padding: '10px 12px',
    background: '#fafafa',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#666',
    lineHeight: 1.5,
  },
};

function TranslatePanelContent({ documentId }: { documentId: string | null }) {
  const [translateLoading, setTranslateLoading] = useState(false);
  const [formatLoading, setFormatLoading] = useState(false);
  const [translateResult, setTranslateResult] = useState<{ zhTitle: string; enTitle: string } | null>(null);
  const [formatResult, setFormatResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { post } = useFetchClient();

  if (!documentId) {
    return <div style={s.notice}>💡 保存文章后即可使用 AI 功能。</div>;
  }

  const handleTranslate = async () => {
    if (translateLoading) return;
    setTranslateLoading(true);
    setError(null);
    setTranslateResult(null);
    setFormatResult(false);
    try {
      const response = await post('/api/ai-translate', { documentId });
      const body = response.data as any;
      if (body?.success && body?.data) {
        setTranslateResult(body.data);
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
      setTranslateLoading(false);
    }
  };

  const handleFormat = async () => {
    if (formatLoading) return;
    setFormatLoading(true);
    setError(null);
    setTranslateResult(null);
    setFormatResult(false);
    try {
      const response = await post('/api/ai-format', { documentId });
      const body = response.data as any;
      if (body?.success) {
        setFormatResult(true);
      } else {
        throw new Error('排版优化失败，请重试');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        '排版优化失败，请重试';
      setError(msg);
    } finally {
      setFormatLoading(false);
    }
  };

  return (
    <div>
      <button
        style={{ ...s.btn, ...(translateLoading ? s.btnDisabled : {}) }}
        onClick={handleTranslate}
        disabled={translateLoading || formatLoading}
      >
        {translateLoading ? '⏳ 翻译中（约30秒）…' : '🌐 翻译并发布双语'}
      </button>
      <p style={s.hint}>将中文内容翻译为英文，同时发布中英文两个版本。</p>

      <button
        style={{ ...s.btn, ...s.btnSecondary, ...(formatLoading ? s.btnDisabled : {}) }}
        onClick={handleFormat}
        disabled={translateLoading || formatLoading}
      >
        {formatLoading ? '⏳ 优化中（约20秒）…' : '✨ AI 优化排版'}
      </button>
      <p style={s.hint}>自动添加标题、引用块等 Markdown 结构，内容不变，保存为草稿。</p>

      {translateResult && (
        <div style={s.success}>
          ✅ 双语发布成功
          <br />
          中文：{translateResult.zhTitle}
          <br />
          English: {translateResult.enTitle}
        </div>
      )}
      {formatResult && (
        <div style={s.success}>
          ✅ 排版优化完成，已保存为草稿，请刷新页面查看。
        </div>
      )}
      {error && <div style={s.error}>❌ {error}</div>}
    </div>
  );
}

const TranslatePanel = ({ model, documentId, document }: any) => {
  if (model !== 'api::article.article') return null;

  return {
    title: 'AI 工具',
    content: <TranslatePanelContent documentId={documentId ?? null} />,
  };
};

export { TranslatePanel };
