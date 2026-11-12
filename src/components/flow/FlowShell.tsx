'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useModalScrollLock } from '@/hooks/useModalScrollLock';

/** Content fades out under the header and above the button instead of being cut off */
const EDGE_FADE = 'linear-gradient(transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%)';

export const SPRING = { type: 'spring' as const, stiffness: 380, damping: 34 };

const SHADE = {
  question: 'linear-gradient(180deg, rgba(7,9,13,0.8) 0%, rgba(7,9,13,0.55) 40%, rgba(7,9,13,0.82) 75%, #07090D 100%)',
  result: 'linear-gradient(180deg, rgba(7,9,13,0.5) 0%, rgba(7,9,13,0.08) 30%, rgba(7,9,13,0.4) 55%, rgba(7,9,13,0.88) 100%)',
  blur: 'rgba(7,9,13,0.72)',
};

interface FlowShellProps {
  /** Accessible name of the whole flow, e.g. "Build your program" */
  label: string;
  photo: string;
  /** Changes whenever the screen changes; drives the slide animation */
  screenKey: string;
  /** 1 = moving forward (slide in from the right), -1 = going back */
  direction: 1 | -1;
  /** 1-based position in the questions. Leave out on building and result screens. */
  step?: number;
  total?: number;
  onBack?: () => void;
  onClose?: () => void;
  shade?: keyof typeof SHADE;
  /** Pinned under the scrolling content: the main button(s) */
  footer?: React.ReactNode;
  /** Dialogs (Sheet) opened from inside the flow. Rendered outside the animated layer. */
  overlays?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Full-screen, one-question-per-screen flow over a photo.
 * Rendered into document.body so the route's page-enter transform cannot trap it.
 */
export function FlowShell({
  label,
  photo,
  screenKey,
  direction,
  step,
  total,
  onBack,
  onClose,
  shade = 'question',
  footer,
  overlays,
  children,
}: FlowShellProps) {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  useModalScrollLock(true);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const slide = reduce ? 0 : 64;
  const variants = {
    enter: (d: number) => ({ x: d * slide, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -slide, opacity: 0 }),
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-[90] print:hidden">
      <div className="on-photo absolute inset-0 overflow-hidden bg-[#07090D]">
        <AnimatePresence initial={false}>
          <motion.div
            key={photo + shade}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.6 }}
          >
            <Image
              src={photo}
              alt=""
              fill
              priority
              sizes="100vw"
              className={`object-cover ${shade === 'blur' ? 'scale-110 blur-xl' : ''}`}
            />
            <div className="absolute inset-0" style={{ background: SHADE[shade] }} />
          </motion.div>
        </AnimatePresence>

        <div className="relative mx-auto flex h-full w-full max-w-[440px] flex-col pt-[env(safe-area-inset-top)]">
          <div className="shrink-0 px-4 pt-3">
            {step && total ? (
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
                role="progressbar"
                aria-label="Progress"
                aria-valuemin={1}
                aria-valuemax={total}
                aria-valuenow={step}
              >
                {Array.from({ length: total }, (_, i) => (
                  <span key={i} className="h-[3px] overflow-hidden rounded-full bg-white/25">
                    <motion.span
                      className="block h-full origin-left rounded-full bg-gym-lime"
                      initial={false}
                      animate={{ scaleX: i < step ? 1 : 0 }}
                      transition={reduce ? { duration: 0 } : SPRING}
                    />
                  </span>
                ))}
              </div>
            ) : (
              <div className="h-[3px]" />
            )}
            <div className="mt-3 flex h-11 items-center justify-between">
              {onBack ? (
                <button type="button" onClick={onBack} className="glass-btn" aria-label="Back">
                  <ArrowLeft className="h-[22px] w-[22px]" strokeWidth={2.4} />
                </button>
              ) : onClose ? (
                <button type="button" onClick={onClose} className="glass-btn" aria-label="Close">
                  <X className="h-5 w-5" strokeWidth={2.4} />
                </button>
              ) : (
                <span />
              )}
              {step && total ? (
                <span className="text-[13px] font-semibold tabular-nums text-gym-textMuted">
                  {step} of {total}
                </span>
              ) : null}
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={screenKey}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={reduce ? { duration: 0.15 } : SPRING}
                className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain px-4 pb-6"
                style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {footer && <div className="shrink-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">{footer}</div>}
        </div>
      </div>
      {overlays}
    </div>,
    document.body
  );
}

/** Large question title and optional one-line explanation */
export function FlowTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="space-y-2 px-2 pb-6 pt-5">
      <h2 className="text-[34px] font-bold leading-[1.08] tracking-[-0.035em] text-gym-text">{title}</h2>
      {sub && <p className="text-[15px] leading-relaxed text-gym-textMuted">{sub}</p>}
    </div>
  );
}
