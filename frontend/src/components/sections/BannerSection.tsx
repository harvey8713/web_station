import Link from 'next/link';
import type {BannerSection as BannerData} from '@/lib/api';

interface Props {
  data: BannerData;
}

export default function BannerSection({data}: Props) {
  const layout = data.layout || 'centered';
  const minH = data.min_height ?? 480;
  const opacity = (data.overlay_opacity ?? 40) / 100;
  const pt = data.padding_top ?? 0;
  const pb = data.padding_bottom ?? 0;
  const bgImage = data.background_image_url || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1600&q=85';

  const isCentered = layout === 'centered';

  return (
    <section
      className="relative overflow-hidden flex flex-col justify-center"
      style={{ minHeight: minH, paddingTop: pt, paddingBottom: pb }}
    >
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div
        className="absolute inset-0 bg-[var(--ink)]"
        style={{ opacity }}
      />
      <div className={`relative z-10 px-8 md:px-[160px] ${isCentered ? 'flex flex-col items-center text-center' : ''}`}>
        {data.heading && (
          <h2 className="font-[family-name:var(--serif)] text-[clamp(36px,5vw,64px)] font-light leading-[1.15] text-[var(--bg)] mb-6 max-w-[700px]">
            {data.heading}
          </h2>
        )}
        {data.subtitle && (
          <p className="font-sans text-[14px] font-light leading-[1.8] text-[rgba(240,237,230,0.75)] mb-10 max-w-[500px]">
            {data.subtitle}
          </p>
        )}
        {data.cta_text && data.cta_link && (
          <Link
            href={data.cta_link}
            className="inline-block font-sans text-[10px] font-medium tracking-[0.25em] uppercase no-underline text-[var(--bg)] px-10 py-[14px] border border-[rgba(240,237,230,0.5)] transition-all hover:bg-[var(--bg)] hover:text-[var(--ink)]"
          >
            {data.cta_text}
          </Link>
        )}
      </div>
    </section>
  );
}
