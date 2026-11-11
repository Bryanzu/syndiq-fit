'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useModalScrollLock } from '@/hooks/useModalScrollLock';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** id of the element that titles the dialog */
  labelledBy?: string;
  /** Tailwind z-index class, e.g. "z-[100]". Stacked sheets pass a higher one. */
  zClass?: string;
  /** Tailwind max-width class for the panel on larger screens */
  maxWidth?: string;
  /**
   * A view-transition name shared with the element this sheet grew out of. When set, the browser
   * morphs that element into the sheet, so the sheet's own slide-up animation is switched off.
   */
  morphName?: string;
  children: React.ReactNode;
}

const DISMISS_DISTANCE = 120; // px dragged down before release closes the sheet
const FLICK_DISTANCE = 40; // px, combined with FLICK_VELOCITY
const FLICK_VELOCITY = 0.6; // px per ms

/**
 * The single dialog surface for the app.
 *  - Phones: a bottom sheet that slides up and can be dragged down by its grabber to dismiss.
 *  - sm and up: a centred dialog.
 * Handles scroll lock, Escape and backdrop-tap to close.
 */
export function Sheet({
  isOpen,
  onClose,
  labelledBy,
  zClass = 'z-[100]',
  maxWidth = 'max-w-2xl',
  morphName,
  children,
}: SheetProps) {
  const { handleBackdropClick } = useModalScrollLock(isOpen, onClose);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);
  const start = useRef<{ y: number; t: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDragY(0);
      setDragging(false);
      setClosing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { y: e.clientY, t: performance.now() };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    setDragY(Math.max(0, e.clientY - start.current.y));
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const dy = Math.max(0, e.clientY - start.current.y);
    const velocity = dy / Math.max(1, performance.now() - start.current.t);
    start.current = null;
    setDragging(false);

    if (dy > DISMISS_DISTANCE || (dy > FLICK_DISTANCE && velocity > FLICK_VELOCITY)) {
      setClosing(true);
      window.setTimeout(onClose, 180);
    } else {
      setDragY(0);
    }
  };

  const moved = dragging || dragY > 0 || closing;
  const panelStyle: React.CSSProperties = {
    ...(morphName ? ({ viewTransitionName: morphName, animation: 'none' } as React.CSSProperties) : {}),
    ...(moved
      ? {
          transform: closing ? 'translateY(100%)' : `translateY(${dragY}px)`,
          transition: dragging ? 'none' : 'transform 0.18s ease-out',
        }
      : {}),
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className={`fixed inset-0 ${zClass} flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn`}
      onClick={handleBackdropClick}
    >
      <div
        style={panelStyle}
        className={`sheet-panel relative w-full ${maxWidth} bg-gym-card text-gym-text flex flex-col overflow-hidden shadow-2xl rounded-t-[28px] sm:rounded-3xl max-h-[92dvh] sm:max-h-[90dvh] pb-[env(safe-area-inset-bottom)] sm:pb-0`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grabber: drag down to dismiss (phones only) */}
        <div
          className="sm:hidden shrink-0 flex justify-center pt-2.5 pb-1.5 cursor-grab active:cursor-grabbing touch-none bg-gym-cardAlt"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          aria-hidden
        >
          <span className="h-1 w-10 rounded-full bg-gym-borderHover" />
        </div>
        {children}
      </div>
    </div>
  );
}
