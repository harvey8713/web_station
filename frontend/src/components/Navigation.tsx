'use client';

import {useState} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {Link, usePathname} from '@/i18n/routing';
import {useGlobal} from '@/components/GlobalProvider';

export default function Navigation() {
  const t = useTranslations('nav');
  const g = useGlobal();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = g?.nav_links?.length
    ? g.nav_links.map((link) => ({ href: link.href, label: link.label }))
    : [
        {href: '/about',    label: g?.nav_about    ?? t('about')},
        {href: '/insights', label: g?.nav_insights ?? t('insights')},
        {href: '/designer', label: g?.nav_profiles ?? t('designer')},
        {href: '/culture',  label: g?.nav_culture  ?? t('culture')},
      ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)] border-b border-[rgba(0,0,0,0.08)]">
        <div className="px-8 md:px-[160px] py-7 flex items-center justify-between">
          <div className="nav-logo">
            <Link href="/">
              <img src="/logo.png" alt="Magician in Jewelry" className="h-12 w-12 object-contain mix-blend-multiply" />
            </Link>
          </div>

          {/* Desktop nav */}
          <ul className="hidden md:flex gap-12 list-none">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-sans text-[13px] font-normal tracking-[0.18em] uppercase no-underline text-[var(--ink)] transition-colors hover:text-[var(--gold)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-5">
            <LanguageToggle />
            {/* Hamburger button — mobile only */}
            <button
              className="md:hidden flex flex-col gap-[5px] p-1"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-px bg-[var(--ink)] transition-transform origin-center ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
              <span className={`block w-5 h-px bg-[var(--ink)] transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-px bg-[var(--ink)] transition-transform origin-center ${menuOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="fixed top-[104px] left-0 right-0 z-40 bg-[var(--bg)] border-b border-[rgba(0,0,0,0.08)] md:hidden">
          <ul className="list-none px-8 py-6 flex flex-col gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-sans text-[13px] font-normal tracking-[0.18em] uppercase no-underline text-[var(--ink)] hover:text-[var(--gold)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
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
