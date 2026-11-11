'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NAV_ITEMS } from './navItems';

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 min-w-0 shrink-0" aria-label="Syndiq Fit home">
      <span className="relative block w-9 h-9 rounded-xl overflow-hidden bg-black shrink-0">
        <Image src="/syndiq-logo.png" alt="Syndiq Fit logo" fill sizes="36px" className="object-contain p-0.5" priority />
      </span>
      <span className="text-[17px] font-semibold tracking-[0.08em] text-gym-text truncate">
        SYNDIQ <span className="text-gym-limeDark dark:text-gym-lime">FIT</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const onSettings = pathname.startsWith('/settings');

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--nav-bg)] backdrop-blur-xl">
      <div className="page flex items-center justify-between gap-4 h-16">
        <Brand />

        {/* DESKTOP navigation — conventional top tabs: icon + short label. Hidden below lg. */}
        <nav data-nav="desktop" aria-label="Primary" className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative inline-flex items-center gap-2 px-3.5 min-h-[44px] rounded-full text-sm font-medium transition-colors ${
                  active
                    ? 'text-gym-text bg-gym-cardInner'
                    : 'text-gym-textMuted hover:text-gym-text hover:bg-gym-cardAlt'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${active ? 'text-gym-limeDark dark:text-gym-lime' : ''}`} strokeWidth={active ? 2.25 : 1.9} />
                <span>{item.label}</span>
                {active && <span className="absolute left-1/2 -bottom-0.5 h-0.5 w-5 -translate-x-1/2 rounded-full bg-gym-lime" />}
              </Link>
            );
          })}
        </nav>

        {/* Utilities (both breakpoints) */}
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <Link
            href="/settings"
            aria-label="Settings"
            aria-current={onSettings ? 'page' : undefined}
            className={`btn-icon ${onSettings ? 'text-gym-limeDark dark:text-gym-lime' : ''}`}
          >
            <Settings className="w-5 h-5" strokeWidth={1.9} />
          </Link>
        </div>
      </div>
    </header>
  );
}
