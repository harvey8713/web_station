import {notFound} from 'next/navigation';
import {getArticleBySlug, getImageUrl} from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';

export const revalidate = 300;

export default async function ArticlePage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  const article = await getArticleBySlug(slug, locale);

  if (!article) {
    notFound();
  }

  return (
    <>
      <Navigation />

      <main className="pt-[160px] pb-32">
        {/* Hero Image — full bleed */}
        {article.cover_image?.url && (
          <div className="w-full h-[60vh] relative mb-16">
            <Image
              src={getImageUrl(article.cover_image.url)}
              alt={article.cover_image.alternativeText || article.title}
              fill
              unoptimized
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Centered content */}
        <div className="flex justify-center px-8 md:px-[120px]">
          <article className="w-full max-w-[860px]">
            {article.category?.name && (
              <p className="font-sans text-[9px] font-medium tracking-[0.25em] uppercase text-[var(--gold)] mb-4">
                {article.category.name}
              </p>
            )}

            <h1 className="font-[family-name:var(--serif)] text-[clamp(36px,4.5vw,58px)] font-light leading-[1.15] mb-6">
              {article.title}
            </h1>

            <div className="font-sans text-[11px] font-normal tracking-[0.1em] text-[var(--ink-muted)] flex gap-4 mb-12 pb-8 border-b border-[rgba(0,0,0,0.1)]">
              <span>{new Date(article.publishedAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</span>
              <span>·</span>
              <span>{article.reading_time} {locale === 'zh' ? '分钟阅读' : 'min read'}</span>
            </div>

            <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content || '' }} />

            <div className="mt-16 pt-10 border-t border-[rgba(0,0,0,0.08)] flex items-center gap-4">
              <div className="w-8 h-px bg-[var(--gold)]"></div>
              <p className="font-sans text-[9px] font-medium tracking-[0.3em] uppercase text-[var(--ink-muted)]">
                Magician in Jewelry
              </p>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </>
  );
}
