'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { hasActiveProgram } from '@/lib/storage';
import { TAB_ITEMS } from './navItems';

const SPRING = { type: 'spring' as const, stiffness: 420, damping: 34 };
/** Scrolled less than this from the top, the pill is always full size */
const TOP_ZONE = 64;
/** Pixels of scroll in one direction before the pill changes size, so small jitters do nothing */
const SCROLL_STEP = 10;

/**
 * MOBILE-ONLY floating pill navigation (hidden from `lg` up — desktop uses the top bar).
 * Round glass buttons; the active one stretches into a lime pill with its label, and the
 * highlight slides between tabs. Scrolling down shrinks it to the active tab alone so it stays
 * out of the content's way; scrolling up, or tapping it, brings the full pill back.
 * Hidden on the first-open screen, which has its own actions.
 */
export function TabBar() {
  const pathname = usePathname();
  // On "/" assume the first-open screen until storage says otherwise, so the pill never flashes there.
  const [hidden, setHidden] = useState(pathname === '/');
  const [scrolledDown, setScrolledDown] = useState(false);
  const [refract, setRefract] = useState(false);

  useEffect(() => {
    setHidden(pathname === '/' && !hasActiveProgram());
    setScrolledDown(false);
  }, [pathname]);

  // Real refraction needs an SVG filter in backdrop-filter, which only Chromium browsers draw.
  // iOS browsers (all WebKit) and Firefox keep the plain frosted glass.
  useEffect(() => {
    const ua = navigator.userAgent;
    setRefract(/Chrome\/\d+/.test(ua) && !/CriOS|FxiOS|Firefox/.test(ua));
  }, []);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < TOP_ZONE) {
        setScrolledDown(false);
        last = y;
        return;
      }
      if (Math.abs(y - last) < SCROLL_STEP) return;
      setScrolledDown(y > last);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (hidden) return null;
  // Pages without a tab of their own (Settings, About...) keep the full pill: a shrunk one would be empty
  const compact = scrolledDown && TAB_ITEMS.some((item) => item.match(pathname));

  return (
    <nav
      data-nav="mobile"
      data-compact={compact ? 'true' : 'false'}
      aria-label="Primary"
      className="lg:hidden fixed left-1/2 -translate-x-1/2 z-40 print:hidden bottom-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id="liquid-refract" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.009 0.022" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="20" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <ul className={`glass-liquid ${refract ? 'refract' : ''} flex items-center rounded-full p-1`}>
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          const shown = active || !compact;
          return (
            <motion.li
              key={item.id}
              initial={false}
              animate={{ width: shown ? 'auto' : 0, opacity: shown ? 1 : 0 }}
              transition={SPRING}
              className="overflow-hidden"
              aria-hidden={shown ? undefined : true}
            >
              <div className="p-0.5">
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  tabIndex={shown ? undefined : -1}
                  onClick={(e) => {
                    // The shrunken pill opens back up instead of reloading the page you are on
                    if (compact && active) {
                      e.preventDefault();
                      setScrolledDown(false);
                    }
                  }}
                  className={`relative flex h-12 items-center justify-center whitespace-nowrap rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gym-lime/70 ${
                    active ? `text-gym-ink ${compact ? 'w-12' : 'px-4'}` : 'w-12 text-gym-text active:scale-90 transition-transform'
                  }`}
                >
                  {active && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-gym-lime" transition={SPRING} />}
                  <span className="relative flex items-center gap-2">
                    <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.9} />
                    {active && !compact && <span className="text-sm font-bold">{item.shortLabel ?? item.label}</span>}
                  </span>
                </Link>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </nav>
  );
}
