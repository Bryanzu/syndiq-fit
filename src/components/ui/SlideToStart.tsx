'use client';

import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const THUMB = 52;
const SPRING = { type: 'spring' as const, stiffness: 500, damping: 40 };

interface SlideToStartProps {
  label: string;
  onComplete: () => void;
}

/**
 * A slider that confirms an action: drag the thumb most of the way across, or press it
 * (click, Enter or Space) to do the same thing without dragging.
 */
export function SlideToStart({ label, onComplete }: SlideToStartProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const x = useMotionValue(0);
  const [max, setMax] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setMax(Math.max(0, el.clientWidth - THUMB - 8));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const labelOpacity = useTransform(x, [0, Math.max(1, max * 0.6)], [1, 0]);
  const trailWidth = useTransform(x, (v) => v + THUMB);

  const complete = () => {
    animate(x, max, SPRING);
    onComplete();
    window.setTimeout(() => x.set(0), 700);
  };

  return (
    <div ref={trackRef} className="glass-inset relative flex h-[60px] items-center rounded-full p-1">
      <motion.span aria-hidden style={{ width: trailWidth }} className="absolute bottom-1 left-1 top-1 rounded-full bg-gym-lime/25" />
      <motion.button
        type="button"
        aria-label={label}
        drag="x"
        dragConstraints={{ left: 0, right: max }}
        dragElastic={0.04}
        dragMomentum={false}
        style={{ x, width: THUMB, height: THUMB }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={() => {
          if (x.get() > max * 0.6) complete();
          else animate(x, 0, SPRING);
          window.setTimeout(() => {
            dragged.current = false;
          }, 60);
        }}
        onClick={() => {
          if (!dragged.current) complete();
        }}
        className="relative z-10 flex shrink-0 cursor-grab touch-none items-center justify-center rounded-full bg-gym-lime text-gym-ink active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2.6} />
      </motion.button>
      <motion.span
        aria-hidden
        style={{ opacity: labelOpacity }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center pl-10 text-[15px] font-semibold text-gym-silver"
      >
        {label}
      </motion.span>
    </div>
  );
}
