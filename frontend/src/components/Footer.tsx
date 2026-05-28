'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import {useGlobal} from '@/components/GlobalProvider';

export default function Footer() {
  const t = useTranslations('footer');
  const g = useGlobal();

  const copyright = g?.footer_copyright ?? t('copyright');
  const instagramUrl = g?.instagram_url || 'https://instagram.com';
  const linkedinUrl = g?.linkedin_url || 'https://linkedin.com';

  return (
    <footer className="px-8 md:px-[80px] py-10 flex items-center justify-between border-t border-[rgba(0,0,0,0.08)]">
      <p className="font-sans text-[11px] font-light text-[var(--ink-muted)] tracking-[0.08em]">
        {copyright}
      </p>
      <ul className="flex gap-6 list-none">
        <li>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[10px] font-normal tracking-[0.18em] uppercase no-underline text-[var(--ink-muted)] transition-colors hover:text-[var(--gold)]"
          >
            Instagram
          </a>
        </li>
        {g?.wechat_id && (
          <li>
            <span className="font-sans text-[10px] font-normal tracking-[0.18em] uppercase text-[var(--ink-muted)]">
              WeChat: {g.wechat_id}
            </span>
          </li>
        )}
        <li>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[10px] font-normal tracking-[0.18em] uppercase no-underline text-[var(--ink-muted)] transition-colors hover:text-[var(--gold)]"
          >
            LinkedIn
          </a>
        </li>
      </ul>
    </footer>
  );
}
