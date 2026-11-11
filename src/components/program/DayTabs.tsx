'use client';

import React from 'react';
import { WorkoutDay } from '@/types/workout';

interface DayTabsProps {
  days: WorkoutDay[];
  activeDayIndex: number;
  onSelectDay: (index: number) => void;
}

/** Segmented pill tabs, horizontally scrollable on narrow screens. */
export function DayTabs({ days, activeDayIndex, onSelectDay }: DayTabsProps) {
  return (
    <div role="tablist" aria-label="Training days" className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      {days.map((day, idx) => {
        const isActive = activeDayIndex === idx;
        const label = day.title.replace(/^Day \d+\s*[—–-]\s*/, '');
        return (
          <button
            key={day.dayNumber}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectDay(idx)}
            className={`shrink-0 rounded-full px-4 py-2 text-left transition-colors min-h-[44px] ${
              isActive ? 'bg-gym-lime text-gym-ink' : 'bg-gym-card text-gym-textMuted hover:text-gym-text'
            }`}
          >
            <span className={`block text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-gym-ink/70' : ''}`}>
              Day {day.dayNumber} · {day.estimatedDuration}m
            </span>
            <span className="block text-sm font-semibold max-w-[11rem] truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
