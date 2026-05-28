import Link from 'next/link';
import Image from 'next/image';
import type {FeaturedArticleSection as FeaturedData, Article} from '@/lib/api';
import {getImageUrl} from '@/lib/api';

interface Props {
  data?: FeaturedData;
  locale: string;
  article?: Article;
}

export default function FeaturedArticleSection({data, locale, article}: Props) {
  if (!article) return null;

  const label = data?.label || (locale === 'zh' ? '精选文章' : 'Featured');
  const layout = data?.layout || 'image-left';
  const pt = data?.padding_top ?? 80;
  const pb = data?.padding_bottom ?? 80;

  const imageBlock = (
    <div className="relative overflow-hidden aspect-[4/3] md:aspect-auto md:min-h-[480px]">
      {article.cover_image?.url ? (
        <Image
          src={getImageUrl(article.cover_image.url)}
          alt={article.cover_image.alternativeText || article.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="w-full h-full min-h-[480px] bg-[var(--paper)] flex items-center justify-center">
          <span className="text-[var(--gold)] text-5xl opacity-30">✦</span>
        </div>
      )}
    </div>
  );

  const textBlock = (
    <div className="px-8 md:px-[80px] py-16 flex flex-col justify-center bg-[var(--bg)]">
      <p className="font-sans text-[9px] font-medium tracking-[0.25em] uppercase text-[var(--gold)] mb-5">
        {article.category?.name}
      </p>
      <h2 className="font-[family-name:var(--serif)] text-[clamp(28px,3.5vw,44px)] font-light leading-[1.25] mb-6">
        {article.title}
      </h2>
      <p className="font-sans text-[14px] font-light leading-[1.9] text-[var(--ink-muted)] mb-8">
        {article.excerpt}
      </p>
      <div className="font-sans text-[10px] tracking-[0.1em] text-[var(--ink-muted)] flex gap-4 mb-8">
        <span>{new Date(article.publishedAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {year: 'numeric', month: 'long'})}</span>
        <span>·</span>
        <span>{article.reading_time} {locale === 'zh' ? '分钟阅读' : 'min read'}</span>
      </div>
      <span className="font-sans text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--ink)] border-b border-[var(--gold)] pb-[2px] inline-block w-fit transition-colors group-hover:text-[var(--gold)]">
        {locale === 'zh' ? '阅读全文 →' : 'Read More →'}
      </span>
    </div>
  );

  return (
    <section style={{ paddingTop: pt, paddingBottom: pb }} className="px-8 md:px-[160px]">
      <p className="font-sans text-[10px] font-normal tracking-[0.3em] uppercase text-[var(--gold)] mb-10">
        {label}
      </p>
      <Link href={`/articles/${article.slug}`} className="block group">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[rgba(0,0,0,0.08)]">
          {layout === 'image-right' ? (
            <>{textBlock}{imageBlock}</>
          ) : (
            <>{imageBlock}{textBlock}</>
          )}
        </div>
      </Link>
    </section>
  );
}
