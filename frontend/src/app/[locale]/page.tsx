import {getTranslations} from 'next-intl/server';
import {getArticles, getHomepage} from '@/lib/api';
import type {PageSection} from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSection from '@/components/sections/HeroSection';
import IntroSection from '@/components/sections/IntroSection';
import ArticleGridSection from '@/components/sections/ArticleGridSection';
import ContactBandSection from '@/components/sections/ContactBandSection';
import QuoteSection from '@/components/sections/QuoteSection';
import BannerSection from '@/components/sections/BannerSection';

export const revalidate = 300;

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations();
  const [homepageData, articlesData] = await Promise.all([
    getHomepage(locale),
    getArticles(locale, 1, 12),
  ]);

  const heroDefaults = {
    eyebrow: t('hero.eyebrow'),
    subtitle: t('hero.subtitle'),
    cta: t('hero.cta'),
    scroll: t('hero.scroll'),
  };
  const introDefaults = {
    label: t('intro.label'),
    body: t('intro.body'),
    link: t('intro.link'),
  };
  const gridDefaults = { viewAll: t('articles.viewAll') };
  const contactDefaults = {
    description: t('contact.description'),
    emailLabel: t('contact.email'),
    instagramLabel: t('contact.instagram'),
    wechatLabel: t('contact.wechat'),
  };

  const renderSection = (section: PageSection, index: number) => {
    switch (section.__component) {
      case 'sections.hero':
        return <HeroSection key={index} data={section} defaults={heroDefaults} />;
      case 'sections.intro':
        return <IntroSection key={index} data={section} locale={locale} defaults={introDefaults} />;
      case 'sections.featured-article':
        return null;
      case 'sections.article-grid':
        return <ArticleGridSection key={index} data={section} locale={locale} articles={articlesData.data} defaults={gridDefaults} />;
      case 'sections.contact-band':
        return <ContactBandSection key={index} data={section} locale={locale} defaults={contactDefaults} />;
      case 'sections.quote':
        return <QuoteSection key={index} data={section} />;
      case 'sections.banner':
        return <BannerSection key={index} data={section} />;
    }
  };

  return (
    <>
      <Navigation />

      {homepageData && homepageData.length > 0 ? (
        homepageData.map((section, i) => renderSection(section, i))
      ) : (
        <>
          <HeroSection defaults={heroDefaults} />
          <IntroSection locale={locale} defaults={introDefaults} />
          <ArticleGridSection locale={locale} articles={articlesData.data} defaults={gridDefaults} />
          <ContactBandSection locale={locale} defaults={contactDefaults} />
        </>
      )}

      <Footer />
    </>
  );
}
