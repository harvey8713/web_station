import type {QuoteSection as QuoteData} from '@/lib/api';

interface Props {
  data: QuoteData;
}

export default function QuoteSection({data}: Props) {
  const layout = data.layout || 'light';
  const pt = data.padding_top ?? 80;
  const pb = data.padding_bottom ?? 80;

  const themeClass = layout === 'dark'
    ? 'bg-[var(--ink)] text-[var(--bg)]'
    : layout === 'gold'
    ? 'bg-[var(--gold)] text-[var(--ink)]'
    : 'bg-[var(--bg)] text-[var(--ink)]';

  const lineColor = layout === 'dark' ? 'bg-[rgba(255,255,255,0.2)]' : 'bg-[var(--gold)]';

  return (
    <section
      className={`px-8 md:px-[120px] flex flex-col items-center text-center ${themeClass}`}
      style={{ paddingTop: pt, paddingBottom: pb }}
    >
      <div className={`w-px h-12 ${lineColor} mb-10`}></div>
      <blockquote className="font-[family-name:var(--serif)] text-[clamp(24px,3.5vw,42px)] font-light leading-[1.4] max-w-[800px] mb-8">
        {data.quote ? `"${data.quote}"` : '"A jewel is not just an adornment — it is a story worn on the body."'}
      </blockquote>
      {data.attribution && (
        <p className="font-sans text-[11px] font-normal tracking-[0.25em] uppercase opacity-50">
          — {data.attribution}
        </p>
      )}
      <div className={`w-px h-12 ${lineColor} mt-10`}></div>
    </section>
  );
}
