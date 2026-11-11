'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { hasActiveProgram } from '@/lib/storage';
import { TAB_ITEMS } from './navItems';

/**
 * MOBILE-ONLY floating pill navigation (hidden from `lg` up — desktop uses the top bar).
 * Round glass buttons; the active one stretches into a lime pill with its label, and the
 * highlight slides between tabs. Hidden on the first-open screen, which has its own actions.
 */
export function TabBar() {
  const pathname = usePathname();
  // On "/" assume the first-open screen until storage says otherwise, so the pill never flashes there.
  const [hidden, setHidden] = useState(pathname === '/');

  useEffect(() => {
    setHidden(pathname === '/' && !hasActiveProgram());
  }, [pathname]);

  if (hidden) return null;

  return (
    <nav
      data-nav="mobile"
      aria-label="Primary"
      className="lg:hidden fixed left-1/2 -translate-x-1/2 z-40 print:hidden bottom-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <ul className="glass-nav flex items-center gap-1 rounded-full p-1.5 shadow-float">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-12 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gym-lime/70 ${
                  active ? 'px-4 text-gym-ink' : 'w-12 text-gym-text active:scale-90 transition-transform'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-gym-lime"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.9} />
                  {active && <span className="text-sm font-bold">{item.shortLabel ?? item.label}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
