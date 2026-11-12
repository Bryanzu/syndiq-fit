'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, MessageSquare } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NAV_ITEMS } from './navItems';

/** One piece of the logo, cut from the artwork as a mask so it takes the theme's colour */
function BrandPiece({ src, className }: { src: string; className: string }) {
  return <span aria-hidden className={`brand-mask block shrink-0 ${className}`} style={{ '--mask': `url(${src})` } as React.CSSProperties} />;
}

/** The lime S, on a clear background: lime on dark and on photos, deep green on the light theme */
function LogoMark() {
  return <BrandPiece src="/brand/syndiq-mark.png" className="animate-logoIn h-8 w-[47px] bg-[var(--brand-mark)]" />;
}

/** SYNDIQ over FIT, as in the logo. The wordmark follows the text colour so it never disappears. */
function Wordmark() {
  return (
    <span aria-hidden className="flex flex-col items-center gap-[3px]">
      <BrandPiece src="/brand/syndiq-wordmark.png" className="h-[15px] w-[97px] bg-gym-text" />
      <BrandPiece src="/brand/syndiq-fit.png" className="h-[9px] w-[41px] bg-[var(--brand-mark)]" />
    </span>
  );
}

function titleFor(pathname: string): string {
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/about')) return 'About';
  return NAV_ITEMS.find((i) => i.match(pathname))?.label ?? 'Syndiq Fit';
}

/**
 * PHONE header. Transparent over the page (so hero photos run to the top edge); once the page
 * scrolls it frosts over and the screen's title fades in, like an iOS large-title bar collapsing.
 */
function MobileTopBar({ pathname }: { pathname: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const onSettings = pathname.startsWith('/settings');
  const onFeedback = pathname.startsWith('/feedback');

  return (
    <header
      data-header="mobile"
      className={`${!scrolled && pathname === '/' ? 'on-photo' : ''} lg:hidden sticky top-0 z-40 w-full pt-[env(safe-area-inset-top)] transition-[background-color,backdrop-filter,border-color] duration-300 border-b ${
        scrolled ? 'bg-[var(--nav-bg)] backdrop-blur-xl hairline' : 'border-transparent'
      }`}
    >
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Syndiq Fit home">
          <LogoMark />
          {/* The wordmark gives way to the page title once the page scrolls */}
          <span className="relative flex min-w-0 items-center">
            <span className={`transition-opacity duration-300 ${scrolled ? 'opacity-0' : 'opacity-100'}`}>
              <Wordmark />
            </span>
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-[17px] font-semibold tracking-tight text-gym-text transition-opacity duration-300 ${
                scrolled ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden={!scrolled}
            >
              {titleFor(pathname)}
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/feedback"
            aria-label="Feedback"
            aria-current={onFeedback ? 'page' : undefined}
            className={`glass-btn ${onFeedback ? '!text-gym-limeDark dark:!text-gym-lime' : ''}`}
          >
            <MessageSquare className="h-5 w-5" strokeWidth={1.9} />
          </Link>
          <ThemeToggle className="glass-btn" />
          <Link
            href="/settings"
            aria-label="Settings"
            aria-current={onSettings ? 'page' : undefined}
            className={`glass-btn ${onSettings ? '!text-gym-limeDark dark:!text-gym-lime' : ''}`}
          >
            <Settings className="h-5 w-5" strokeWidth={1.9} />
          </Link>
        </div>
      </div>
    </header>
  );
}

/** DESKTOP header: brand, section tabs and utilities in one frosted bar. */
function DesktopTopBar({ pathname }: { pathname: string }) {
  const onSettings = pathname.startsWith('/settings');

  return (
    <header className="hidden lg:block sticky top-0 z-40 w-full bg-[var(--nav-bg)] backdrop-blur-xl">
      <div className="page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5" aria-label="Syndiq Fit home">
          <LogoMark />
          <Wordmark />
        </Link>

        <nav data-nav="desktop" aria-label="Primary" className="glass flex items-center gap-1 rounded-full p-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex min-h-[40px] items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors ${
                  active ? 'bg-gym-lime font-semibold text-gym-ink' : 'text-gym-textMuted hover:text-gym-text'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 1.9} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <Link
            href="/settings"
            aria-label="Settings"
            aria-current={onSettings ? 'page' : undefined}
            className={`btn-icon ${onSettings ? 'text-gym-limeDark dark:text-gym-lime' : ''}`}
          >
            <Settings className="h-5 w-5" strokeWidth={1.9} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Navbar() {
  const pathname = usePathname();
  return (
    <>
      <MobileTopBar pathname={pathname} />
      <DesktopTopBar pathname={pathname} />
    </>
  );
}
