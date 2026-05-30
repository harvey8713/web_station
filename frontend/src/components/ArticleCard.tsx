'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import Image from 'next/image';
import {Article, getImageUrl} from '@/lib/api';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({article}: ArticleCardProps) {
  const t = useTranslations();

  return (
    <article className="cursor-pointer group">
      <Link href={`/articles/${article.slug}`}>
        <div className="w-full aspect-square overflow-hidden mb-6 relative">
          <div className="w-full h-full transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]">
            {article.cover_image?.url ? (
              <Image
                src={getImageUrl(article.cover_image.url)}
                alt={article.cover_image.alternativeText || article.title}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[var(--paper)] flex items-center justify-center">
                <span className="text-[var(--gold)] text-4xl opacity-40">✦</span>
              </div>
            )}
          </div>
        </div>
        <p className="font-sans text-[9px] font-medium tracking-[0.25em] uppercase text-[var(--gold)] mb-3">
          {article.category?.name || t('category.forecast')}
        </p>
        <h3 className="font-[family-name:var(--serif)] text-[22px] font-normal leading-[1.35] mb-3">
          {article.title}
        </h3>
        <p className="font-sans text-[13px] font-light leading-[1.7] text-[var(--ink-muted)] mb-5">
          {article.excerpt}
        </p>
        <div className="font-sans text-[10px] font-normal tracking-[0.1em] text-[var(--ink-muted)] flex gap-4">
          <span>{new Date(article.publishedAt).toLocaleDateString(article.locale === 'zh' ? 'zh-CN' : 'en-US', {year: 'numeric', month: 'short'})}</span>
          <span>·</span>
          <span>{article.reading_time} {t('meta.readTime')}</span>
        </div>
      </Link>
    </article>
  );
}
