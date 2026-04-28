import {notFound} from 'next/navigation';
import {getArticleBySlug, getImageUrl} from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';

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

      <main className="pt-[120px] pb-20">
        {/* Hero Image */}
        <div className="w-full h-[60vh] relative mb-16">
          <Image
            src={getImageUrl(article.cover_image?.url)}
            alt={article.cover_image?.alternativeText || article.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Article Content */}
        <article className="max-w-[800px] mx-auto px-[60px]">
          <p className="font-sans text-[9px] font-medium tracking-[0.25em] uppercase text-[var(--gold)] mb-4">
            {article.category?.name}
          </p>

          <h1 className="font-[family-name:var(--serif)] text-[clamp(42px,5vw,64px)] font-light leading-[1.1] mb-6">
            {article.title}
          </h1>

          <div className="font-sans text-[11px] font-normal tracking-[0.1em] text-[var(--ink-muted)] flex gap-4 mb-12 pb-8 border-b border-[rgba(0,0,0,0.1)]">
            <span>{new Date(article.publishedAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</span>
            <span>·</span>
            <span>{article.reading_time} min read</span>
          </div>

          <div
            className="prose prose-lg max-w-none font-sans text-[16px] font-light leading-[1.8] text-[var(--ink)]"
            dangerouslySetInnerHTML={{__html: article.content}}
          />
        </article>
      </main>

      <Footer />
    </>
  );
}
