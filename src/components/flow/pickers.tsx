'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Remembers where a smooth scroll is heading, so a second tap or key press before it lands
 * moves one more step instead of repeating the first.
 */
function useScrollTarget() {
  const target = useRef<number | null>(null);
  const clear = useRef<number | undefined>(undefined);
  return {
    from: (current: number) => target.current ?? current,
    set: (i: number) => {
      target.current = i;
      window.clearTimeout(clear.current);
      clear.current = window.setTimeout(() => (target.current = null), 700);
    },
  };
}

/* ------------------------------------------------------------------ */
/* Wheel: a vertical, snapping list like the iOS date picker           */
/* ------------------------------------------------------------------ */
const ROW = 56;

interface WheelPickerProps<T> {
  values: T[];
  value: T;
  onChange: (value: T) => void;
  format?: (value: T) => string;
  /** Accessible name, e.g. "Age" */
  label: string;
  /** Spoken after the value, e.g. "years" */
  unit?: string;
}

export function WheelPicker<T>({ values, value, onChange, format = String, label, unit = '' }: WheelPickerProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const index = Math.max(0, values.indexOf(value));
  const [pos, setPos] = useState(index);
  const latest = useRef({ value, onChange, values });
  latest.current = { value, onChange, values };
  const target = useScrollTarget();

  // Keep the scroll position on the value (first paint, and when the parent changes it)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (Math.round(el.scrollTop / ROW) !== index) {
      el.scrollTop = index * ROW;
      setPos(index);
    }
  }, [index]);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const p = el.scrollTop / ROW;
    setPos(p);
    const { values: vs, value: current, onChange: change } = latest.current;
    const next = vs[clamp(Math.round(p), 0, vs.length - 1)];
    if (next !== current) change(next);
  };

  const scrollTo = (i: number) => {
    const to = clamp(i, 0, values.length - 1);
    target.set(to);
    ref.current?.scrollTo({ top: to * ROW, behavior: reduce ? 'auto' : 'smooth' });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 }[e.key];
    if (step) {
      e.preventDefault();
      scrollTo(target.from(index) + step);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      scrollTo(e.key === 'Home' ? 0 : values.length - 1);
    }
  };

  return (
    <div
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={values.length - 1}
      aria-valuenow={index}
      aria-valuetext={`${format(value)} ${unit}`.trim()}
      onKeyDown={onKeyDown}
      className="relative rounded-[32px] outline-none focus-visible:ring-2 focus-visible:ring-gym-lime/70"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 flex h-[76px] -translate-y-1/2 flex-col items-center justify-between">
        <span className="h-0.5 w-[140px] rounded-full bg-gym-lime" />
        <span className="h-0.5 w-[140px] rounded-full bg-gym-lime" />
      </div>
      {unit && (
        <span aria-hidden className="pointer-events-none absolute right-[calc(50%-112px)] top-1/2 -translate-y-1/2 text-lg font-semibold text-gym-textMuted">
          {unit}
        </span>
      )}
      <div
        ref={ref}
        onScroll={onScroll}
        aria-hidden
        className="no-scrollbar h-[280px] snap-y snap-mandatory overflow-y-scroll overscroll-contain"
        style={{ maskImage: 'linear-gradient(transparent, #000 25%, #000 75%, transparent)', WebkitMaskImage: 'linear-gradient(transparent, #000 25%, #000 75%, transparent)' }}
      >
        <div style={{ height: ROW * 2 }} />
        {values.map((v, i) => {
          const d = Math.abs(i - pos);
          const centre = d < 0.5;
          return (
            <button
              key={String(v)}
              type="button"
              tabIndex={-1}
              onClick={() => scrollTo(i)}
              className={`flex h-14 w-full snap-center items-center justify-center text-[32px] font-semibold tabular-nums ${
                centre ? 'font-bold text-gym-lime' : 'text-gym-text'
              }`}
              style={{ transform: `scale(${Math.max(0.7, 1.75 - d * 0.75)})`, opacity: Math.max(0.3, 1 - d * 0.32) }}
            >
              {format(v)}
            </button>
          );
        })}
        <div style={{ height: ROW * 2 }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ruler: a horizontal, snapping scale with a fixed lime pointer        */
/* ------------------------------------------------------------------ */
const TICK = 12;

interface RulerPickerProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
  unit: string;
}

export function RulerPicker({ min, max, value, onChange, label, unit }: RulerPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const count = max - min + 1;
  const index = clamp(Math.round(value) - min, 0, count - 1);
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };
  const target = useScrollTarget();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (Math.round(el.scrollLeft / TICK) !== index) el.scrollLeft = index * TICK;
  }, [index]);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const next = min + clamp(Math.round(el.scrollLeft / TICK), 0, count - 1);
    if (next !== latest.current.value) latest.current.onChange(next);
  };

  const nudge = (by: number) => {
    const to = clamp(target.from(index) + by, 0, count - 1);
    target.set(to);
    ref.current?.scrollTo({ left: to * TICK, behavior: reduce ? 'auto' : 'smooth' });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const by = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 }[e.key];
    if (by) {
      e.preventDefault();
      nudge(by);
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-4">
      <div className="flex items-center gap-5">
        <button type="button" onClick={() => nudge(-1)} className="glass-btn" aria-label={`Less ${label.toLowerCase()}`}>
          <Minus className="h-5 w-5" strokeWidth={2.4} />
        </button>
        <span className="flex min-w-[150px] items-baseline justify-center gap-1.5">
          <span aria-live="polite" className="text-[80px] font-bold leading-none tracking-[-0.05em] tabular-nums text-gym-lime">
            {Math.round(value)}
          </span>
          <span className="text-xl font-semibold text-gym-textMuted">{unit}</span>
        </span>
        <button type="button" onClick={() => nudge(1)} className="glass-btn" aria-label={`More ${label.toLowerCase()}`}>
          <Plus className="h-5 w-5" strokeWidth={2.4} />
        </button>
      </div>
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
        aria-valuetext={`${Math.round(value)} ${unit}`}
        onKeyDown={onKeyDown}
        className="relative w-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gym-lime/70"
      >
        <div
          ref={ref}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-scroll overscroll-contain"
          style={{ maskImage: 'linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)' }}
        >
          <span className="shrink-0" style={{ width: `calc(50% - ${TICK / 2}px)` }} />
          {Array.from({ length: count }, (_, i) => {
            const n = min + i;
            return (
              <span key={n} className="relative flex h-[76px] w-3 shrink-0 snap-center justify-center">
                <span className={`mt-3 w-0.5 rounded-full ${n % 5 === 0 ? 'h-8 bg-white/60' : 'h-5 bg-white/35'}`} />
                {n % 10 === 0 && (
                  <span className="absolute top-[50px] text-[13px] font-semibold tabular-nums text-gym-textMuted">{n}</span>
                )}
              </span>
            );
          })}
          <span className="shrink-0" style={{ width: `calc(50% - ${TICK / 2}px)` }} />
        </div>
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[52px] w-1 -translate-x-1/2 rounded-full bg-gym-lime" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stops: a few fixed values on a ruler, e.g. session length            */
/* ------------------------------------------------------------------ */
interface StopPickerProps<T extends number> {
  values: T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

export function StopPicker<T extends number>({ values, value, onChange, label }: StopPickerProps<T>) {
  const track = useRef<HTMLDivElement>(null);
  /** Where the finger is, as a fraction of the track width, while dragging */
  const [drag, setDrag] = useState<number | null>(null);
  const n = values.length;
  const i = Math.max(0, values.indexOf(value));
  const first = 0.5 / n;
  const last = 1 - 0.5 / n;

  const read = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const f = clamp((clientX - r.left) / r.width, first, last);
    return { f, idx: clamp(Math.round(f * n - 0.5), 0, n - 1) };
  };
  const follow = (clientX: number) => {
    const { f, idx } = read(clientX);
    setDrag(f);
    if (values[idx] !== value) onChange(values[idx]);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    follow(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag !== null) follow(e.clientX);
  };
  const onPointerEnd = () => setDrag(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const to = { ArrowLeft: i - 1, ArrowDown: i - 1, ArrowRight: i + 1, ArrowUp: i + 1, Home: 0, End: n - 1 }[e.key];
    if (to !== undefined) {
      e.preventDefault();
      onChange(values[clamp(to, 0, n - 1)]);
    }
  };

  const left = drag ?? (i + 0.5) / n;

  return (
    <div className="w-full">
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={values[0]}
        aria-valuemax={values[n - 1]}
        aria-valuenow={value}
        aria-valuetext={`${value} minutes`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKeyDown}
        className="relative h-[72px] cursor-grab touch-pan-y select-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gym-lime/70 active:cursor-grabbing"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[26px] h-7"
          style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.42) 0 2px, transparent 2px 14px)' }}
        />
        <span
          aria-hidden
          className={`pointer-events-none absolute top-0 flex h-full w-7 -translate-x-1/2 flex-col items-center ${
            drag === null ? 'transition-[left] duration-500 ease-[cubic-bezier(0.3,1.4,0.5,1)] motion-reduce:transition-none' : ''
          }`}
          style={{ left: `${left * 100}%` }}
        >
          <span className={`size-7 rounded-full bg-gym-lime shadow-[0_4px_14px_rgba(0,0,0,0.45)] transition-transform ${drag !== null ? 'scale-110' : ''}`} />
          <span className="-mt-1 w-1 flex-1 rounded-full bg-gym-lime" />
        </span>
      </div>
      <div role="radiogroup" aria-label={label} className="grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {values.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={v === value}
            onClick={() => onChange(v)}
            className={`tap h-11 text-[15px] font-semibold tabular-nums ${v === value ? 'text-gym-text' : 'text-gym-textMuted'}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
