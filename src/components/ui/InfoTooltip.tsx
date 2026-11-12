'use client';

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  title?: string;
  content: string;
  className?: string;
  iconSize?: number;
}

/** Space kept between the popover and the screen edges */
const EDGE = 12;
/** Gap between the icon and the popover */
const GAP = 8;
const MAX_WIDTH = 320;
const ARROW = 10;

interface Placement {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  arrowLeft: number;
  side: 'above' | 'below';
}

/**
 * The small "i" button with an explanation. The popover is drawn in a layer above the page
 * (a portal into document.body), so cards with overflow-hidden cannot cut it off. It is kept
 * inside the screen, opens above the icon when there is room and below it otherwise.
 * Tap toggles it on touch screens; a mouse opens it on hover.
 */
export function InfoTooltip({ title, content, className = '', iconSize = 14 }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [place, setPlace] = useState<Placement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  /** Opened by a click or tap (stays until dismissed), rather than by hovering */
  const pinned = useRef(false);
  const id = useId();

  const open = () => {
    window.clearTimeout(closeTimer.current);
    setIsOpen(true);
  };
  const close = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    pinned.current = false;
    setIsOpen(false);
    setPlace(null);
  }, []);
  // A short delay lets a mouse move from the icon onto the popover without it closing
  const closeSoon = () => {
    if (pinned.current) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(close, 120);
  };
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const measure = useCallback(() => {
    const trigger = triggerRef.current;
    const pop = popoverRef.current;
    if (!trigger || !pop) return;
    const t = trigger.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const width = Math.min(MAX_WIDTH, vw - EDGE * 2);
    const centre = t.left + t.width / 2;
    const left = Math.min(Math.max(centre - width / 2, EDGE), vw - width - EDGE);
    const spaceAbove = t.top - GAP - EDGE;
    const spaceBelow = vh - t.bottom - GAP - EDGE;
    // Full height of the text, even when the box is currently shortened to fit
    const height = (pop.firstElementChild as HTMLElement | null)?.scrollHeight ?? pop.scrollHeight;
    const side: Placement['side'] = height <= spaceAbove || spaceAbove >= spaceBelow ? 'above' : 'below';
    const maxHeight = Math.max(80, side === 'above' ? spaceAbove : spaceBelow);
    const shown = Math.min(height, maxHeight);
    const top = side === 'above' ? t.top - GAP - shown : t.bottom + GAP;
    const arrowLeft = Math.min(Math.max(centre - left, 18), width - 18);
    setPlace({ left, top, width, maxHeight, arrowLeft, side });
  }, []);

  // Place it before it paints, then keep it attached to the icon while the page moves
  useLayoutEffect(() => {
    if (isOpen) measure();
  }, [isOpen, content, measure]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };
    const onMove = () => {
      const t = triggerRef.current?.getBoundingClientRect();
      // Close once the icon has scrolled out of view; otherwise follow it
      if (!t || t.bottom < 0 || t.top > window.innerHeight) close();
      else measure();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [isOpen, close, measure]);

  return (
    <span className={`relative inline-flex items-center align-middle mx-1 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={title ? `Information about ${title}` : 'More information'}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? id : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isOpen && pinned.current) close();
          else {
            pinned.current = true;
            open();
          }
        }}
        onPointerEnter={(e) => e.pointerType === 'mouse' && open()}
        onPointerLeave={(e) => e.pointerType === 'mouse' && closeSoon()}
        className="relative rounded-full p-0.5 text-gym-textMuted transition-colors before:absolute before:-inset-3 before:content-[''] hover:text-gym-limeDark focus:outline-none focus-visible:ring-2 focus-visible:ring-gym-lime/70 dark:hover:text-gym-lime"
      >
        <Info style={{ width: iconSize, height: iconSize }} className="shrink-0" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            id={id}
            role="tooltip"
            // Events from a portal still bubble to React parents; keep taps here off the meal card
            onClick={(e) => e.stopPropagation()}
            onPointerEnter={(e) => e.pointerType === 'mouse' && open()}
            onPointerLeave={(e) => e.pointerType === 'mouse' && closeSoon()}
            className="fixed z-[170] animate-fadeIn print:hidden"
            style={
              place
                ? { left: place.left, top: place.top, width: place.width }
                : { left: 0, top: 0, width: Math.min(MAX_WIDTH, window.innerWidth - EDGE * 2), visibility: 'hidden' }
            }
          >
            <div
              className="no-scrollbar overflow-y-auto overscroll-contain rounded-2xl border border-gym-border bg-gym-card p-4 text-left shadow-float"
              style={{ maxHeight: place?.maxHeight }}
            >
              {title && <p className="mb-1.5 text-sm font-semibold leading-snug text-gym-limeDark dark:text-gym-lime">{title}</p>}
              <p className="text-[13px] font-normal normal-case leading-relaxed tracking-normal text-gym-silver">{content}</p>
            </div>
            {place && (
              <span
                aria-hidden
                className={`absolute size-[10px] rotate-45 border-gym-border bg-gym-card ${
                  place.side === 'above' ? '-bottom-[5px] border-b border-r' : '-top-[5px] border-l border-t'
                }`}
                style={{ left: place.arrowLeft - ARROW / 2 }}
              />
            )}
          </div>,
          document.body
        )}
    </span>
  );
}
