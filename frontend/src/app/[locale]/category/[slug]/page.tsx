import {notFound} from 'next/navigation';
import {getArticlesByCategory} from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';

export const revalidate = 300;

export default async function CategoryPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  const articlesData = await getArticlesByCategory(slug, locale, 1, 12);

  if (!articlesData.data.length) {
    notFound();
  }

  const categoryName = articlesData.data[0]?.category?.name || slug;

  return (
    <>
      <Navigation />

      <main className="pt-[160px] pb-20 px-8 md:px-[80px]">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-16 pb-8 border-b border-[rgba(0,0,0,0.1)]">
            <p className="font-sans text-[10px] font-normal tracking-[0.3em] uppercase text-[var(--gold)] mb-4">
              Category
            </p>
            <h1 className="font-[family-name:var(--serif)] text-[clamp(48px,6vw,72px)] font-light leading-[1.1]">
              {categoryName}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {articlesData.data.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
