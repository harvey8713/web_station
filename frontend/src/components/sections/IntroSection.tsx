import Link from 'next/link';
import type {IntroSection as IntroData} from '@/lib/api';

interface Props {
  data?: IntroData;
  locale: string;
  defaults: { label: string; body: string; link: string };
}

export default function IntroSection({data, locale, defaults}: Props) {
  const label = defaults.label;
  const body = defaults.body;
  const linkText = defaults.link;
  const linkUrl = data?.link_url || '/about';
  const bgImage = data?.background_image_url || '/about-bg.webp';
  const headingZh = '工艺与品牌智识的交汇';
  const layout = data?.layout || 'image-left';
  const minH = data?.min_height ?? 520;

  const pt = data?.padding_top;
  const pb = data?.padding_bottom;

  const textBlock = (
    <div className="pl-8 md:pl-12 py-20 flex flex-col justify-center bg-[var(--bg)]">
      <p className="font-sans text-[10px] font-normal tracking-[0.3em] uppercase text-[var(--gold)] mb-8">
        {label}
      </p>
      <h2 className="font-[family-name:var(--serif)] text-[clamp(36px,4vw,52px)] font-light leading-[1.2] text-[var(--ink)] mb-7">
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
      className="relative overflow-hidden min-h-[280px] md:min-h-0"
      style={{background: `linear-gradient(rgba(10,8,5,0.38), rgba(10,8,5,0.38)), url('${bgImage}') center/cover no-repeat`}}
    >
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-[family-name:var(--serif)] font-light leading-none select-none pointer-events-none text-[rgba(255,255,255,0.04)]"
        style={{fontSize: '320px'}}
      >
        M
      </span>
      <span className="absolute bottom-10 left-10 font-sans text-[10px] tracking-[0.2em] uppercase text-[rgba(255,255,255,0.45)]">
        Magician in Jewelry · Est. 2024
      </span>
    </div>
  );

  if (layout === 'text-only') {
    return (
      <section
        className="px-8 md:px-[160px] py-20"
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
        className="relative bg-[var(--ink)] flex flex-col items-center text-center overflow-hidden"
        style={{
          paddingTop: pt != null ? pt : 96,
          paddingBottom: pb != null ? pb : 96,
        }}
      >
        {/* top rule */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-40" />

        {/* decorative background letter */}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-[family-name:var(--serif)] text-[clamp(200px,30vw,360px)] font-light leading-none text-[rgba(255,255,255,0.03)] select-none pointer-events-none">
          M
        </span>

        <div className="relative z-10 flex flex-col items-center px-6 md:px-[80px] max-w-[800px]">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-px bg-[var(--gold)] opacity-60" />
            <p className="font-sans text-[9px] font-medium tracking-[0.4em] uppercase text-[var(--gold)]">{label}</p>
            <div className="w-10 h-px bg-[var(--gold)] opacity-60" />
          </div>

          <h2 className="font-[family-name:var(--serif)] text-[clamp(38px,5vw,64px)] font-light leading-[1.15] text-[var(--bg)] mb-8">
            {locale === 'zh' ? <>{headingZh}</> : <>Where <em className="italic text-[var(--gold-light)]">craft</em> meets brand intelligence</>}
          </h2>

          <p className="font-sans text-[14px] font-light leading-[1.9] text-[rgba(250,250,248,0.55)] mb-10 max-w-[520px]">
            {body}
          </p>

          <Link
            href={linkUrl}
            className="font-sans text-[10px] font-medium tracking-[0.25em] uppercase no-underline text-[var(--bg)] px-8 py-[12px] border border-[rgba(250,250,248,0.3)] transition-all hover:bg-[var(--bg)] hover:text-[var(--ink)] inline-block"
          >
            {linkText}
          </Link>
        </div>

        {/* bottom rule */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-40" />
      </section>
    );
  }

  // image-left or image-right
  return (
    <section
      className="px-8 md:px-[160px]"
      style={{
        paddingTop: pt != null ? pt : undefined,
        paddingBottom: pb != null ? pb : undefined,
      }}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ minHeight: minH }}
      >
        {layout === 'image-right' ? (
          <>{textBlock}{imageBlock}</>
        ) : (
          <>{imageBlock}{textBlock}</>
        )}
      </div>
    </section>
  );
}
