'use client';

import React from 'react';
import { WorkoutDay } from '@/types/workout';

interface DayTabsProps {
  days: WorkoutDay[];
  activeDayIndex: number;
  onSelectDay: (index: number) => void;
}

/** One glass pill per training day, horizontally scrollable on narrow screens. */
export function DayTabs({ days, activeDayIndex, onSelectDay }: DayTabsProps) {
  return (
    <div role="tablist" aria-label="Training days" className="no-scrollbar -mx-4 flex items-stretch gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
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
            className={`tap shrink-0 rounded-[22px] px-4 py-2.5 text-left ${
              isActive ? 'bg-gym-lime text-gym-ink' : 'glass text-gym-text'
            }`}
          >
            <span className={`block text-xs font-semibold ${isActive ? 'text-gym-ink/75' : 'text-gym-textMuted'}`}>
              Day {day.dayNumber} · {day.estimatedDuration} min
            </span>
            <span className="block max-w-[11rem] truncate text-[15px] font-bold">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
