'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Settings } from 'lucide-react';
import { NAV_ITEMS, DESKTOP_MEDIA_QUERY } from './navItems';

/**
 * MOBILE-ONLY floating navigation (hidden from `lg` up — desktop uses the top bar).
 *  - collapsed: only the active section's icon
 *  - tap it: all section icons expand (icons only, no text)
 *  - choose one: navigates and collapses again
 */
export function ExpandableNavDock() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  const active = NAV_ITEMS.find((i) => i.match(pathname));
  const FallbackIcon = pathname.startsWith('/settings') ? Settings : LayoutGrid;
  const ActiveIcon = active?.icon ?? FallbackIcon;
  const activeLabel = active?.label ?? (pathname.startsWith('/settings') ? 'Settings' : 'Menu');

  // Collapse on route change.
  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  // Collapse when the viewport crosses into desktop so state is never stale after resizing.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onChange = () => setExpanded(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Outside tap / Escape collapse.
  useEffect(() => {
    if (!expanded) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setExpanded(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [expanded]);

  const size = 'size-10 min-[400px]:size-11';

  return (
    <nav
      ref={rootRef}
      data-nav="mobile"
      aria-label="Primary"
      className="lg:hidden fixed left-1/2 -translate-x-1/2 z-40 bottom-[max(0.875rem,env(safe-area-inset-bottom))] print:hidden"
    >
      <div
        className={`flex items-center rounded-full bg-gym-card p-1.5 shadow-float ring-1 ring-black/5 dark:ring-white/10 transition-[box-shadow] duration-300`}
        data-expanded={expanded}
      >
        {/* When no section matches (e.g. Settings) a neutral icon stands in as "active", then folds away on expand. */}
        {!active && (
          <div
            className={`overflow-hidden transition-[max-width,opacity,padding] duration-300 ease-smooth ${
              expanded ? 'max-w-0 opacity-0 px-0 pointer-events-none' : 'max-w-[52px] opacity-100 px-0.5'
            }`}
            aria-hidden={expanded}
          >
            <button
              type="button"
              aria-label={`${activeLabel} — tap to expand navigation`}
              aria-expanded={expanded}
              tabIndex={expanded ? -1 : 0}
              onClick={() => setExpanded(true)}
              className={`${size} shrink-0 rounded-full inline-flex items-center justify-center bg-gym-lime text-gym-ink`}
            >
              <ActiveIcon className="w-5 h-5" strokeWidth={2.25} />
            </button>
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active?.id === item.id;
          const visible = expanded || isActive;
          const wrapperState = visible
            ? 'max-w-[44px] min-[400px]:max-w-[52px] opacity-100 px-0.5'
            : 'max-w-0 opacity-0 px-0 pointer-events-none';

          return (
            <div
              key={item.id}
              className={`overflow-hidden transition-[max-width,opacity,padding] duration-300 ease-smooth ${wrapperState}`}
              aria-hidden={!visible}
            >
              {isActive ? (
                <button
                  type="button"
                  aria-label={`${item.label} — tap to ${expanded ? 'collapse' : 'expand'} navigation`}
                  aria-expanded={expanded}
                  aria-current="page"
                  onClick={() => setExpanded((v) => !v)}
                  className={`${size} shrink-0 rounded-full inline-flex items-center justify-center bg-gym-lime text-gym-ink`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2.25} />
                </button>
              ) : (
                <Link
                  href={item.href}
                  aria-label={item.label}
                  tabIndex={visible ? 0 : -1}
                  onClick={() => setExpanded(false)}
                  className={`${size} shrink-0 rounded-full inline-flex items-center justify-center text-gym-textMuted hover:text-gym-text hover:bg-gym-cardInner transition-colors`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.9} />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
