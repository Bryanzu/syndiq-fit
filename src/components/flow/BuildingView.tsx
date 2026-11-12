'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';

interface BuildingViewProps {
  title: string;
  icon: React.ReactNode;
  /** Up to three short lines that tick in one after another */
  lines: string[];
  /** Called once the lines have played */
  onDone: () => void;
}

const LINE_GAP = 0.6; // seconds between lines

/**
 * The short "building" moment between the last question and the result. The work itself is
 * already done when this shows; it gives the result a beat to land.
 */
export function BuildingView({ title, icon, lines, onDone }: BuildingViewProps) {
  const reduce = useReducedMotion();
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const ms = reduce ? 700 : (0.3 + lines.length * LINE_GAP + 0.5) * 1000;
    const t = window.setTimeout(() => done.current(), ms);
    return () => window.clearTimeout(t);
  }, [reduce, lines.length]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center pb-16" role="status" aria-live="polite">
      <div className="relative size-40">
        <span className="absolute inset-0 rounded-full border-[6px] border-white/15" />
        <span className="absolute inset-0 animate-spin rounded-full border-[6px] border-transparent border-r-gym-lime border-t-gym-lime [animation-duration:1.1s] motion-reduce:animate-none" />
        <span className="absolute inset-[30px] flex items-center justify-center rounded-full bg-white/10 text-gym-lime">{icon}</span>
      </div>
      <h2 className="mt-10 text-center text-[30px] font-bold leading-tight tracking-[-0.035em] text-gym-text">{title}</h2>
      <ul className="mt-8 flex w-full max-w-[300px] flex-col gap-4">
        {lines.map((line, i) => (
          <motion.li
            key={line}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * LINE_GAP, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3"
          >
            <motion.span
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * LINE_GAP, type: 'spring', stiffness: 600, damping: 20 }}
              className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-gym-lime text-gym-ink"
            >
              <Check className="h-[15px] w-[15px]" strokeWidth={3.4} />
            </motion.span>
            <span className="text-base font-medium text-gym-text">{line}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/** The frosted result card pinned to the bottom of the final screen */
export function ResultPanel({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex min-h-full flex-col justify-end">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass space-y-4 rounded-[40px] p-6"
      >
        {children}
      </motion.div>
    </div>
  );
}
