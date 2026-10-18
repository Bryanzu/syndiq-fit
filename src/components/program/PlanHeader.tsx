'use client';

import React from 'react';
import { WorkoutProgram } from '@/types/workout';
import { FileDown, QrCode, RotateCcw, ShieldAlert, User, Dumbbell, Clock, Flame, Calendar } from 'lucide-react';
import Link from 'next/link';

interface PlanHeaderProps {
  program: WorkoutProgram;
  onDownloadPdf: () => void;
  onOpenShare: () => void;
  isGeneratingPdf?: boolean;
}

export function PlanHeader({
  program,
  onDownloadPdf,
  onOpenShare,
  isGeneratingPdf = false,
}: PlanHeaderProps) {
  const profile = program.userProfile;

  const formatGoal = (g: string) =>
    g
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const formatExp = (e: string) =>
    e
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  return (
    <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl transition-colors">
      {/* Top Bar: Title & Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-gym-border">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gym-lime text-black shadow-lime-sm">
              Syndiq fit Official Plan
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
              <span>{program.days.length} Days / Week</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            {program.name}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-2xl leading-relaxed">
            {program.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-5 py-3 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-xs sm:text-sm shadow-lime-md transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
          >
            <FileDown className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenShare}
            className="px-4 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs sm:text-sm border border-zinc-300 dark:border-zinc-700 transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <QrCode className="w-4 h-4 text-gym-limeDark dark:text-gym-lime" />
            <span>Send to Phone</span>
          </button>

          <Link
            href="/questionnaire"
            className="px-3.5 py-3 rounded-xl bg-slate-50 hover:bg-zinc-100 dark:bg-[#141414] dark:hover:bg-zinc-800 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white border border-zinc-200 dark:border-gym-border transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-semibold min-h-[44px]"
            title="Edit Answers"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Modify</span>
          </Link>
        </div>
      </div>

      {/* Member Profile Metrics Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141414] border border-zinc-200 dark:border-gym-border/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-gym-limeDark dark:text-gym-lime shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-zinc-500 dark:text-zinc-400 block tracking-wider">Lifter</span>
            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white capitalize">
              {profile.gender}, {profile.age}y
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141414] border border-zinc-200 dark:border-gym-border/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-gym-limeDark dark:text-gym-lime shrink-0">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-zinc-500 dark:text-zinc-400 block tracking-wider">Experience</span>
            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              {formatExp(profile.experience)}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141414] border border-zinc-200 dark:border-gym-border/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-gym-limeDark dark:text-gym-lime shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-zinc-500 dark:text-zinc-400 block tracking-wider">Duration</span>
            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              {profile.duration} Mins / Session
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141414] border border-zinc-200 dark:border-gym-border/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-gym-limeDark dark:text-gym-lime shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-zinc-500 dark:text-zinc-400 block tracking-wider">Focus</span>
            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[130px] block">
              {formatGoal(profile.goal)}
            </span>
          </div>
        </div>
      </div>

      {/* Injury Notice Banner if present */}
      {profile.injuries && profile.injuries.length > 0 && !profile.injuries.includes('none') && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-900 dark:text-amber-200">
              Joint Safety Filter Active: {profile.injuries.map((i) => i.replace('_', ' ')).join(', ')}
            </p>
            <p className="text-amber-700/80 dark:text-amber-300/80 leading-relaxed text-xs">
              Exercises that place excessive strain on your selected joints have been automatically substituted with verified safe alternatives.
              {profile.injuryNotes && <span className="block mt-1 italic">Note: "{profile.injuryNotes}"</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
