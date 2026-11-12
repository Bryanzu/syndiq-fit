'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { SPRING } from './FlowShell';

/* Selected surfaces share one look: lime outline on a lime tint. Unselected ones are plain glass. */
const ON = 'border-[1.5px] border-gym-lime bg-gym-lime/15 backdrop-blur-2xl';
const OFF = 'glass';

function Tick({ on }: { on: boolean }) {
  return on ? (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 600, damping: 22 }}
      className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-gym-lime text-gym-ink"
    >
      <Check className="h-[15px] w-[15px]" strokeWidth={3.4} />
    </motion.span>
  ) : (
    <span className="size-[26px] shrink-0 rounded-full border-[1.5px] border-white/45" />
  );
}

interface ChoiceRowProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  sub?: string;
  leading?: React.ReactNode;
}

/** One option in a single-choice list. Place inside an element with role="radiogroup". */
export function ChoiceRow({ selected, onSelect, label, sub, leading }: ChoiceRowProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`tap flex min-h-[72px] w-full items-center gap-4 rounded-[26px] px-5 py-3 text-left transition-colors ${selected ? ON : OFF}`}
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-semibold text-gym-text">{label}</span>
        {sub && <span className="mt-0.5 block text-[13px] leading-snug text-gym-textMuted">{sub}</span>}
      </span>
      <Tick on={selected} />
    </button>
  );
}

interface ChoiceTileProps {
  selected: boolean;
  onSelect: () => void;
  label?: string;
  sub?: string;
  icon?: React.ReactNode;
  /** Large text shown in place of an icon, e.g. "3 + 1" */
  big?: string;
  centered?: boolean;
  className?: string;
}

/** A large square option for two- or four-way choices */
export function ChoiceTile({ selected, onSelect, label, sub, icon, big, centered, className = '' }: ChoiceTileProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`tap flex flex-col rounded-[32px] p-[18px] text-left transition-colors ${selected ? ON : OFF} ${
        centered ? 'items-center justify-center gap-4 text-center' : 'items-start justify-between'
      } ${className}`}
    >
      {icon && (
        <span
          className={`flex shrink-0 items-center justify-center rounded-full transition-colors ${
            centered ? 'size-[88px]' : 'size-11'
          } ${selected ? 'bg-gym-lime text-gym-ink' : 'bg-white/15 text-gym-text'}`}
        >
          {icon}
        </span>
      )}
      {big && (
        <span className={`text-[40px] font-bold leading-none tracking-[-0.04em] ${selected ? 'text-gym-lime' : 'text-gym-text'}`}>
          {big}
        </span>
      )}
      <span className="flex flex-col gap-0.5">
        {label && <span className={`font-bold text-gym-text ${centered ? 'text-xl tracking-tight' : 'text-[17px]'}`}>{label}</span>}
        {sub && <span className="text-[13px] leading-snug text-gym-textMuted">{sub}</span>}
      </span>
    </button>
  );
}

interface ChipProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** "fill" turns the chip lime when on; "outline" keeps it glass with a lime outline and tick */
  variant?: 'fill' | 'outline' | 'white';
  role?: 'radio' | 'checkbox';
}

export function Chip({ selected, onClick, children, variant = 'fill', role = 'checkbox' }: ChipProps) {
  const on =
    variant === 'fill'
      ? 'border border-gym-lime bg-gym-lime font-bold text-gym-ink'
      : variant === 'white'
      ? 'border border-white bg-white font-bold text-gym-ink'
      : `${ON} font-semibold text-gym-text`;
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={`tap inline-flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-[18px] text-[15px] transition-colors ${
        selected ? on : 'glass font-semibold text-gym-text'
      }`}
    >
      {children}
      {selected && variant === 'outline' && <Check className="h-[15px] w-[15px] text-gym-lime" strokeWidth={3.2} />}
    </button>
  );
}

/** A row of chips that scrolls sideways and bleeds to the screen edges */
export function ChipScroller({
  children,
  label,
  role = 'group',
}: {
  children: React.ReactNode;
  label: string;
  role?: 'group' | 'radiogroup';
}) {
  return (
    <div role={role} aria-label={label} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {children}
    </div>
  );
}

interface SegmentedProps<T extends string | number> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Unique per screen so the moving pill animates within its own control */
  id: string;
  size?: 'sm' | 'lg';
}

export function Segmented<T extends string | number>({ label, options, value, onChange, id, size = 'lg' }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="glass-inset grid gap-1 rounded-full p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`relative rounded-full font-semibold transition-colors ${size === 'lg' ? 'h-[52px] text-[15px]' : 'h-10 px-4 text-sm'} ${
              on ? 'text-gym-ink' : 'text-gym-text'
            }`}
          >
            {on && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-white" transition={SPRING} />}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex h-8 w-[52px] shrink-0 items-center rounded-full p-[3px] transition-colors ${
        checked ? 'justify-end bg-gym-lime' : 'justify-start bg-gym-borderHover'
      }`}
    >
      <motion.span layout transition={SPRING} className={`size-[26px] rounded-full ${checked ? 'bg-gym-ink' : 'bg-white'}`} />
    </button>
  );
}

interface FlowButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  arrow?: boolean;
}

/** The lime main button at the bottom of each screen */
export function FlowButton({ children, onClick, disabled, arrow = true }: FlowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`tap flex h-[60px] w-full items-center rounded-full bg-gym-lime text-[17px] font-bold text-gym-ink transition-opacity disabled:opacity-50 ${
        arrow ? 'justify-between pl-[26px] pr-1.5' : 'justify-center'
      }`}
    >
      {children}
      {arrow && (
        <span className="flex size-12 items-center justify-center rounded-full bg-gym-ink text-gym-lime">
          <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2.6} />
        </span>
      )}
    </button>
  );
}

export function FlowSecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap glass-inset flex h-14 w-full items-center justify-center rounded-full text-[15px] font-semibold text-gym-text"
    >
      {children}
    </button>
  );
}

/** Small heading above a group of controls */
export function GroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-2 pb-3 text-[13px] font-semibold text-gym-textMuted">{children}</p>;
}
