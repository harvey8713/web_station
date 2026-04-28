import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import type {ArticleGridSection as GridData, Article} from '@/lib/api';

interface Props {
  data?: GridData;
  locale: string;
  articles: Article[];
  defaults: { viewAll: string };
}

export default function ArticleGridSection({data, locale, articles, defaults}: Props) {
  const count = data?.article_count || 3;
  const viewAllText = data?.view_all_text || defaults.viewAll;
  const displayed = articles.slice(0, count);
  const layout = data?.layout || '3-col';
  const pt = data?.padding_top ?? 100;
  const pb = data?.padding_bottom ?? 100;

  const titlePrefix = data?.title_prefix;
  const titleHighlight = data?.title_highlight;

  const gridClass = layout === '2-col'
    ? 'grid grid-cols-1 md:grid-cols-2 gap-10'
    : layout === 'list'
    ? 'flex flex-col gap-10 divide-y divide-[rgba(0,0,0,0.06)]'
    : 'grid grid-cols-1 md:grid-cols-3 gap-10';

  return (
    <section className="px-[60px]" style={{ paddingTop: pt, paddingBottom: pb }}>
      <div className="flex items-baseline justify-between mb-16 border-b border-[rgba(0,0,0,0.1)] pb-6">
        <h2 className="font-[family-name:var(--serif)] text-[clamp(32px,4vw,48px)] font-light">
          {titlePrefix && titleHighlight ? (
            <>{titlePrefix} <em className="italic font-[family-name:var(--serif)]">{titleHighlight}</em></>
          ) : locale === 'zh' ? (
            <>最新<em className="italic font-[family-name:var(--serif)]">洞察</em></>
          ) : (
            <>Latest <em className="italic font-[family-name:var(--serif)]">Insights</em></>
          )}
        </h2>
        <Link
          href="/insights"
          className="font-sans text-[11px] font-medium tracking-[0.2em] uppercase no-underline text-[var(--ink)] border-b border-[var(--gold)] pb-[2px] transition-colors hover:text-[var(--gold)]"
        >
          {viewAllText}
        </Link>
      </div>
      <div className={gridClass}>
        {displayed.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
