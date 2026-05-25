import {getTranslations} from 'next-intl/server';
import {getArticlesByCategory} from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';

export const revalidate = 300;

export default async function DesignerPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations();
  const articlesData = await getArticlesByCategory('designer', locale, 1, 12);

  return (
    <>
      <Navigation />

      <main className="pt-[120px] pb-20 px-[60px]">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-16 pb-8 border-b border-[rgba(0,0,0,0.1)]">
            <h1 className="font-[family-name:var(--serif)] text-[clamp(48px,6vw,72px)] font-light leading-[1.1]">
              {t('nav.designer')}
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
