import type {ContactBandSection as ContactData} from '@/lib/api';

interface Props {
  data?: ContactData;
  locale: string;
  defaults: { description: string; emailLabel: string; instagramLabel: string; wechatLabel: string };
}

export default function ContactBandSection({data, locale, defaults}: Props) {
  const description = data?.description || defaults.description;
  const email = data?.email || 'hello@magicianinjewelry.com';
  const instagram = data?.instagram || '@magicianinjewelry';
  const wechat = data?.wechat || 'MagicianInJewelry';

  const headingLine1 = data?.heading_line1;
  const headingLine2 = data?.heading_line2;
  const pt = data?.padding_top;
  const pb = data?.padding_bottom;

  return (
    <section
      className="grid grid-cols-2 bg-[var(--ink)] text-[var(--bg)]"
      style={{ paddingTop: pt != null ? pt : undefined, paddingBottom: pb != null ? pb : undefined }}
    >
      <div className="px-3 md:px-[160px] py-10 md:py-20 border-r border-[rgba(255,255,255,0.08)]">
        <h2 className="font-[family-name:var(--serif)] text-[clamp(16px,4vw,52px)] font-light leading-[1.2] mb-4 md:mb-8">
          {headingLine1 && headingLine2 ? (
            <>{headingLine1}<br/><em className="italic text-[var(--gold-light)]">{headingLine2}</em></>
          ) : locale === 'zh' ? (
            <>来聊聊<br/><em className="italic text-[var(--gold-light)]">珠宝。</em></>
          ) : (
            <>Let&apos;s talk<br/>about <em className="italic text-[var(--gold-light)]">jewelry.</em></>
          )}
        </h2>
        <p className="font-sans text-[11px] md:text-[14px] font-light leading-[1.8] text-[rgba(240,237,230,0.65)] max-w-[360px]">
          {description}
        </p>
      </div>
      <div className="px-3 md:px-[160px] py-10 md:py-20 flex flex-col justify-center gap-4 md:gap-8 items-end text-right">
        <div>
          <p className="font-sans text-[7px] md:text-[9px] font-medium tracking-[0.3em] uppercase text-[rgba(255,255,255,0.35)] mb-2">
            {defaults.emailLabel}
          </p>
          <p className="font-[family-name:var(--serif)] text-[10px] md:text-[20px] font-light text-[var(--bg)]">
            <a href={`mailto:${email}`} className="text-inherit no-underline hover:text-[var(--gold-light)]">
              {email}
            </a>
          </p>
        </div>
        <div>
          <p className="font-sans text-[7px] md:text-[9px] font-medium tracking-[0.3em] uppercase text-[rgba(255,255,255,0.35)] mb-2">
            {defaults.instagramLabel}
          </p>
          <p className="font-[family-name:var(--serif)] text-[10px] md:text-[20px] font-light text-[var(--bg)]">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-inherit no-underline hover:text-[var(--gold-light)]">
              {instagram}
            </a>
          </p>
        </div>
        <div>
          <p className="font-sans text-[7px] md:text-[9px] font-medium tracking-[0.3em] uppercase text-[rgba(255,255,255,0.35)] mb-2">
            {defaults.wechatLabel}
          </p>
          <p className="font-[family-name:var(--serif)] text-[10px] md:text-[20px] font-light text-[var(--bg)]">
            {wechat}
          </p>
        </div>
      </div>
    </section>
  );
}
