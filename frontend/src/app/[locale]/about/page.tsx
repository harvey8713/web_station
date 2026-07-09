import {getTranslations} from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default async function AboutPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations();

  return (
    <>
      <Navigation />

      <main className="pt-[160px] pb-20 px-8 md:px-[160px]">
        <div className="max-w-[860px] mx-auto">
          <div className="mb-16">
            <p className="font-sans text-[10px] font-normal tracking-[0.3em] uppercase text-[var(--gold)] mb-8">
              {t('intro.label')}
            </p>
            <h1 className="font-[family-name:var(--serif)] text-[clamp(48px,6vw,72px)] font-light leading-[1.1] mb-8">
              {locale === 'zh' ? (
                <>工艺与<br/>品牌智识的交汇</>
              ) : (
                <>Where <em className="italic">craft</em> meets<br/>brand intelligence</>
              )}
            </h1>
          </div>

          <div className="mb-16">
            <img
              src="/about_us.jpg"
              alt="About Magician in Jewellery"
              className="w-full object-cover object-top"
              style={{ maxHeight: '520px' }}
            />
          </div>

          <div className="space-y-8 font-sans text-[16px] font-light leading-[1.9] text-[var(--ink)]">
            <p>
              {t('intro.body')}
            </p>

            <p className="text-[var(--ink-muted)]">
              {locale === 'zh'
                ? '我们相信，珠宝不仅仅是装饰品——它是品牌叙事、文化表达和设计哲学的载体。通过深入的分析和独特的视角，我们探索珠宝设计如何塑造品牌身份，以及品牌如何通过设计传达其价值观。'
                : 'We believe that jewelry is more than adornment — it is a vehicle for brand narrative, cultural expression, and design philosophy. Through in-depth analysis and unique perspectives, we explore how jewelry design shapes brand identity, and how brands communicate their values through design.'
              }
            </p>

            <div className="pt-8 border-t border-[rgba(0,0,0,0.1)]">
              <h2 className="font-[family-name:var(--serif)] text-[32px] font-light mb-6">
                {locale === 'zh' ? '我们的使命' : 'Our Mission'}
              </h2>
              <p className="text-[var(--ink-muted)]">
                {locale === 'zh'
                  ? '为珠宝行业的从业者、品牌创始人、设计师和爱好者提供有深度的内容，帮助他们理解珠宝设计与品牌建设的本质，启发创新思维，推动行业发展。'
                  : 'To provide in-depth content for jewelry industry practitioners, brand founders, designers, and enthusiasts, helping them understand the essence of jewelry design and brand building, inspire innovative thinking, and drive industry development.'
                }
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
