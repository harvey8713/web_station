'use client';

import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/routing';

export default function Navigation() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const navLinks = [
    {href: '/about', label: t('about')},
    {href: '/insights', label: t('insights')},
    {href: '/profiles', label: t('profiles')},
    {href: '/culture', label: t('culture')},
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

  return (
    <div className="flex gap-0 border border-[var(--ink)]">
      <Link
        href={pathname}
        locale="en"
        className="bg-none border-none cursor-pointer font-sans text-[10px] font-medium tracking-[0.12em] uppercase px-[10px] py-[5px] text-[var(--ink-muted)] transition-all hover:bg-[var(--ink)] hover:text-[var(--bg)]"
      >
        EN
      </Link>
      <Link
        href={pathname}
        locale="zh"
        className="bg-none border-none cursor-pointer font-sans text-[10px] font-medium tracking-[0.12em] uppercase px-[10px] py-[5px] text-[var(--ink-muted)] transition-all hover:bg-[var(--ink)] hover:text-[var(--bg)]"
      >
        中文
      </Link>
    </div>
  );
}
