'use client';

import React from 'react';
import { WorkoutDay } from '@/types/workout';
import { Calendar, Clock, Dumbbell } from 'lucide-react';

interface DayTabsProps {
  days: WorkoutDay[];
  activeDayIndex: number;
  onSelectDay: (index: number) => void;
}

export function DayTabs({ days, activeDayIndex, onSelectDay }: DayTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {days.map((day, idx) => {
        const isActive = activeDayIndex === idx;
        return (
          <button
            key={day.dayNumber}
            type="button"
            onClick={() => onSelectDay(idx)}
            className={`flex flex-col items-start px-4 py-3 rounded-2xl border transition-all text-left shrink-0 min-w-[150px] sm:min-w-[180px] ${
              isActive
                ? 'bg-gym-card border-gym-lime shadow-lime-sm'
                : 'bg-[#141414] border-gym-border hover:border-zinc-700 hover:bg-[#18181b]'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span
                className={`text-[11px] font-black uppercase tracking-wider ${
                  isActive ? 'text-gym-lime' : 'text-zinc-400'
                }`}
              >
                Day {day.dayNumber}
              </span>
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-400" />
                {day.estimatedDuration}m
              </span>
            </div>
            <h4
              className={`text-xs sm:text-sm font-bold line-clamp-1 ${
                isActive ? 'text-white' : 'text-zinc-300'
              }`}
            >
              {day.title.replace(/^Day \d+\s*[—–-]\s*/, '')}
            </h4>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400">
              <Dumbbell className="w-3 h-3 text-gym-lime" />
              <span>{day.exercises.length} exercises</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
