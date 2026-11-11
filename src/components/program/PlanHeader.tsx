'use client';

import React from 'react';
import { WorkoutProgram } from '@/types/workout';
import { FileDown, QrCode, RotateCcw, ShieldAlert, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface PlanHeaderProps {
  program: WorkoutProgram;
  onDownloadPdf: () => void;
  onOpenShare: () => void;
  onClearProgram?: () => void;
  isGeneratingPdf?: boolean;
}

const titleCase = (s: string) =>
  s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export function PlanHeader({
  program,
  onDownloadPdf,
  onOpenShare,
  onClearProgram,
  isGeneratingPdf = false,
}: PlanHeaderProps) {
  const profile = program.userProfile;
  const hasInjuries = profile.injuries && profile.injuries.length > 0 && !profile.injuries.includes('none');

  const facts: [string, string][] = [
    ['Days / week', String(program.days.length)],
    ['Session', `${profile.duration} min`],
    ['Experience', titleCase(profile.experience)],
    ['Focus', titleCase(profile.goal)],
  ];

  return (
    <header className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 lg:max-w-xl space-y-2">
          <p className="t-eyebrow">Your program</p>
          <h1 className="t-title break-words">{program.name}</h1>
          <p className="t-body">{program.description}</p>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0">
          <button type="button" onClick={onDownloadPdf} disabled={isGeneratingPdf} className="btn-primary">
            <FileDown className="w-4 h-4" />
            {isGeneratingPdf ? 'Generating PDF…' : 'Download PDF'}
          </button>
          <button type="button" onClick={onOpenShare} className="btn-secondary">
            <QrCode className="w-4 h-4" /> Send to phone
          </button>
          <Link href="/questionnaire" className="btn-icon" title="Edit answers" aria-label="Edit answers">
            <RotateCcw className="w-[18px] h-[18px]" />
          </Link>
          {onClearProgram && (
            <button type="button" onClick={onClearProgram} className="btn-icon hover:!text-red-500" title="Clear program" aria-label="Clear program">
              <Trash2 className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>
      </div>

      {/* Key facts: one quiet row instead of four bordered tiles */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 py-5 hairline border-y">
        {facts.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="t-eyebrow !text-[11px]">{label}</dt>
            <dd className="mt-0.5 text-base font-semibold text-gym-text truncate">{value}</dd>
          </div>
        ))}
      </dl>

      {profile.secondaryGoals && profile.secondaryGoals.length > 0 && (
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className="t-small">Also training for</span>
          {profile.secondaryGoals.map((g) => (
            <span key={g} className="chip-accent">{titleCase(g)}</span>
          ))}
        </p>
      )}

      {hasInjuries && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Joint safety filter on: {profile.injuries.map((i) => i.replace('_', ' ')).join(', ')}</p>
            <p className="opacity-80 leading-relaxed">
              Exercises that strain these joints were swapped for safer alternatives.
              {profile.injuryNotes && <span className="block mt-1 italic">“{profile.injuryNotes}”</span>}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
