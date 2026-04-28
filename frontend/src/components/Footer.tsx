'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="px-[60px] py-10 flex items-center justify-between border-t border-[rgba(0,0,0,0.08)]">
      <p className="font-sans text-[11px] font-light text-[var(--ink-muted)] tracking-[0.08em]">
        {t('copyright')}
      </p>
      <ul className="flex gap-6 list-none">
        <li>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[10px] font-normal tracking-[0.18em] uppercase no-underline text-[var(--ink-muted)] transition-colors hover:text-[var(--gold)]"
          >
            Instagram
          </a>
        </li>
        <li>
          <a
            href="#"
            className="font-sans text-[10px] font-normal tracking-[0.18em] uppercase no-underline text-[var(--ink-muted)] transition-colors hover:text-[var(--gold)]"
          >
            WeChat
          </a>
        </li>
        <li>
          <a
            href="https://linkedin.com"
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
