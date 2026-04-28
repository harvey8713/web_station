import Link from 'next/link';
import type {IntroSection as IntroData} from '@/lib/api';

interface Props {
  data?: IntroData;
  locale: string;
  defaults: { label: string; body: string; link: string };
}

export default function IntroSection({data, locale, defaults}: Props) {
  const label = data?.label || defaults.label;
  const body = data?.body || defaults.body;
  const linkText = data?.link_text || defaults.link;
  const linkUrl = data?.link_url || '/about';
  const bgImage = data?.background_image_url || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200&q=85';
  const headingZh = data?.heading_zh || '工艺与品牌智识的交汇';
  const layout = data?.layout || 'image-left';
  const minH = data?.min_height ?? 520;

  const pt = data?.padding_top;
  const pb = data?.padding_bottom;

  const textBlock = (
    <div className="px-[80px] py-20 flex flex-col justify-center">
      <p className="font-sans text-[10px] font-normal tracking-[0.3em] uppercase text-[var(--gold)] mb-8">
        {label}
      </p>
      <h2 className="font-[family-name:var(--serif)] text-[clamp(36px,4vw,52px)] font-light leading-[1.2] mb-7">
        {locale === 'zh' ? (
          <>{headingZh}</>
        ) : (
          <>Where <em className="italic">craft</em> meets<br/>brand intelligence</>
        )}
      </h2>
      <p className="font-sans text-[14px] font-light leading-[1.9] text-[var(--ink-muted)] mb-10">
        {body}
      </p>
      <Link
        href={linkUrl}
        className="font-sans text-[11px] font-medium tracking-[0.2em] uppercase no-underline text-[var(--ink)] border-b border-[var(--gold)] pb-[2px] transition-colors hover:text-[var(--gold)] inline-block w-fit"
      >
        {linkText}
      </Link>
    </div>
  );

  const imageBlock = (
    <div
      className="relative overflow-hidden bg-center bg-cover"
      style={{backgroundImage: `url('${bgImage}')`}}
    >
      <span className="absolute bottom-10 left-10 font-sans text-[10px] tracking-[0.2em] uppercase text-[rgba(255,255,255,0.45)]">
        Magician in Jewellery · Est. 2024
      </span>
    </div>
  );

  if (layout === 'text-only') {
    return (
      <section
        className="px-[80px] py-20"
        style={{
          paddingTop: pt != null ? pt : undefined,
          paddingBottom: pb != null ? pb : undefined,
        }}
      >
        <div className="max-w-[720px]">
          <p className="font-sans text-[10px] font-normal tracking-[0.3em] uppercase text-[var(--gold)] mb-8">{label}</p>
          <h2 className="font-[family-name:var(--serif)] text-[clamp(36px,4vw,52px)] font-light leading-[1.2] mb-7">
            {locale === 'zh' ? <>{headingZh}</> : <>Where <em className="italic">craft</em> meets brand intelligence</>}
          </h2>
          <p className="font-sans text-[14px] font-light leading-[1.9] text-[var(--ink-muted)] mb-10">{body}</p>
          <Link href={linkUrl} className="font-sans text-[11px] font-medium tracking-[0.2em] uppercase no-underline text-[var(--ink)] border-b border-[var(--gold)] pb-[2px] transition-colors hover:text-[var(--gold)] inline-block w-fit">
            {linkText}
          </Link>
        </div>
      </section>
    );
  }

  if (layout === 'text-centered') {
    return (
      <section
        className="px-[80px] py-24 flex flex-col items-center text-center"
        style={{
          paddingTop: pt != null ? pt : undefined,
          paddingBottom: pb != null ? pb : undefined,
        }}
      >
        <p className="font-sans text-[10px] font-normal tracking-[0.3em] uppercase text-[var(--gold)] mb-8">{label}</p>
        <h2 className="font-[family-name:var(--serif)] text-[clamp(36px,4vw,52px)] font-light leading-[1.2] mb-7 max-w-[640px]">
          {locale === 'zh' ? <>{headingZh}</> : <>Where <em className="italic">craft</em> meets brand intelligence</>}
        </h2>
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent my-6"></div>
        <p className="font-sans text-[14px] font-light leading-[1.9] text-[var(--ink-muted)] mb-10 max-w-[560px]">{body}</p>
        <Link href={linkUrl} className="font-sans text-[11px] font-medium tracking-[0.2em] uppercase no-underline text-[var(--ink)] border-b border-[var(--gold)] pb-[2px] transition-colors hover:text-[var(--gold)] inline-block w-fit">
          {linkText}
        </Link>
      </section>
    );
  }

  // image-left or image-right
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2"
      style={{
        minHeight: minH,
        paddingTop: pt != null ? pt : undefined,
        paddingBottom: pb != null ? pb : undefined,
      }}
    >
      {layout === 'image-right' ? (
        <>{textBlock}{imageBlock}</>
      ) : (
        <>{imageBlock}{textBlock}</>
      )}
    </section>
  );
}
