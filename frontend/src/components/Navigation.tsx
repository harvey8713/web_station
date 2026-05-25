'use client';

import {useTranslations, useLocale} from 'next-intl';
import {Link, usePathname} from '@/i18n/routing';
import {useGlobal} from '@/components/GlobalProvider';

export default function Navigation() {
  const t = useTranslations('nav');
  const g = useGlobal();
  const pathname = usePathname();

  const navLinks = g?.nav_links?.length
    ? g.nav_links.map((link) => ({ href: link.href, label: link.label }))
    : [
        {href: '/about',    label: g?.nav_about    ?? t('about')},
        {href: '/insights', label: g?.nav_insights ?? t('insights')},
        {href: '/designer', label: g?.nav_profiles ?? t('designer')},
        {href: '/culture',  label: g?.nav_culture  ?? t('culture')},
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[60px] py-7 bg-[rgba(250,250,248,0.92)] backdrop-blur-[12px] border-b border-transparent transition-colors">
      <div className="nav-logo">
        <Link href="/">
          <img src="/logo.jpg" alt="Magician in Jewellery" className="h-9 w-9 object-contain" />
        </Link>
      </div>
      <ul className="hidden md:flex gap-12 list-none">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-sans text-[11px] font-normal tracking-[0.18em] uppercase no-underline text-[var(--ink)] transition-colors hover:text-[var(--gold)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-5">
        <LanguageToggle />
      </div>
    </nav>
  );
}

function LanguageToggle() {
  const pathname = usePathname();
  const locale = useLocale();

  const base = "font-sans text-[10px] font-medium tracking-[0.12em] uppercase px-[10px] py-[5px] transition-all no-underline";
  const active = "bg-[var(--ink)] text-[var(--bg)]";
  const inactive = "text-[var(--ink-muted)] hover:bg-[var(--ink)] hover:text-[var(--bg)]";

  return (
    <div className="flex gap-0 border border-[var(--ink)]">
      <Link href={pathname} locale="en" className={`${base} ${locale === 'en' ? active : inactive}`}>
        EN
      </Link>
      <Link href={pathname} locale="zh" className={`${base} ${locale === 'zh' ? active : inactive}`}>
        中文
      </Link>
    </div>
  );
}
