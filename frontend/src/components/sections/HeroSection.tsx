import Link from 'next/link';
import type {HeroSection as HeroData} from '@/lib/api';

interface Props {
  data?: HeroData;
  defaults: { eyebrow: string; subtitle: string; cta: string; scroll: string };
}

export default function HeroSection({data, defaults}: Props) {
  const eyebrow = data?.eyebrow || defaults.eyebrow;
  const subtitle = data?.subtitle || defaults.subtitle;
  const ctaText = data?.cta_text || defaults.cta;
  const ctaLink = data?.cta_link || '/insights';
  const layout = data?.layout || 'centered';

  const pt = data?.padding_top;
  const pb = data?.padding_bottom;
  const sectionStyle = {
    paddingTop: pt != null ? pt : 120,
    ...(pb != null ? { paddingBottom: pb } : {}),
  };

  const isCentered = layout === 'centered';

  return (
    <section
      className={`min-h-screen flex flex-col px-8 md:px-[160px] relative overflow-hidden ${isCentered ? 'items-center' : 'items-start'}`}
      style={sectionStyle}
    >
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
        <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--gold-light)] to-transparent opacity-35 left-[15%]"></div>
        <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--gold-light)] to-transparent opacity-35 left-1/2"></div>
        <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--gold-light)] to-transparent opacity-35 right-[15%]"></div>
      </div>

      <div className={`flex flex-col flex-1 justify-center relative z-10 ${isCentered ? 'items-center text-center' : 'items-start'}`}>
        <p className="font-sans text-[10px] font-normal tracking-[0.35em] uppercase text-[var(--gold)] mb-8">
          {eyebrow}
        </p>
        <h1 className={`font-[family-name:var(--serif)] font-light text-[clamp(72px,10vw,148px)] leading-[1.05] tracking-[-0.02em] mb-10 ${isCentered ? '' : 'max-w-[80vw]'}`}>
          {data?.title_line1 || 'Magician'}<br/>
          {(() => {
            const line2 = data?.title_line2 || 'in Jewelry';
            const spaceIdx = line2.indexOf(' ');
            if (spaceIdx === -1) return <em className="italic text-[var(--ink-muted)]">{line2}</em>;
            return (
              <>
                <span className="not-italic text-[var(--ink-muted)]">{line2.slice(0, spaceIdx)}</span><br/>
                <em className="italic text-[var(--ink-muted)]">{line2.slice(spaceIdx + 1)}</em>
              </>
            );
          })()}
        </h1>
        <div className={`w-20 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent mb-8 ${isCentered ? 'mx-auto' : ''}`}></div>
        <p className={`font-sans text-[13px] font-light tracking-[0.06em] leading-[1.8] text-[var(--ink-muted)] max-w-[480px] mb-12 ${isCentered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
        <Link
          href={ctaLink}
          className="inline-block font-sans text-[10px] font-medium tracking-[0.25em] uppercase no-underline text-[var(--ink)] px-10 py-[14px] border border-[var(--ink)] transition-all hover:bg-[var(--ink)] hover:text-[var(--bg)]"
        >
          {ctaText}
        </Link>
      </div>

      <div className="pb-10 font-sans text-[9px] tracking-[0.25em] uppercase text-[var(--ink-muted)] flex flex-col items-center gap-3 relative z-10">
        <span>{defaults.scroll}</span>
        <div className="w-px h-10 bg-gradient-to-b from-[var(--gold)] to-transparent animate-scroll-down"></div>
      </div>
    </section>
  );
}
