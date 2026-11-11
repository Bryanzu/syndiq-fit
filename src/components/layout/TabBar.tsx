'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TAB_ITEMS } from './navItems';

/**
 * MOBILE-ONLY persistent bottom tab bar (hidden from `lg` up — desktop uses the top bar).
 * Every section is always one tap away, with its label visible. The centre "Create" tab is
 * the primary action and is drawn as a raised accent button.
 */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      data-nav="mobile"
      aria-label="Primary"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 print:hidden bg-[var(--nav-bg)] backdrop-blur-xl hairline border-t pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 px-1">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          const isPrimary = item.id === 'create';

          return (
            <li key={item.id} className="flex">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`tap flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[10.5px] font-medium tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gym-lime/70 ${
                  active ? 'text-gym-text' : 'text-gym-textMuted'
                }`}
              >
                {isPrimary ? (
                  <span
                    className={`flex size-9 items-center justify-center rounded-full bg-gym-lime text-gym-ink ${
                      active ? 'ring-2 ring-gym-lime/40 ring-offset-2 ring-offset-gym-bg' : ''
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" strokeWidth={2.4} />
                  </span>
                ) : (
                  <>
                    <Icon
                      className={`w-[22px] h-[22px] ${active ? 'text-gym-limeDark dark:text-gym-lime' : ''}`}
                      strokeWidth={active ? 2.4 : 1.8}
                    />
                    <span className={active ? 'font-semibold' : ''}>{item.shortLabel ?? item.label}</span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
