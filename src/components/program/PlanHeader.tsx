'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WorkoutProgram } from '@/types/workout';
import { FileDown, QrCode, RotateCcw, ShieldAlert, Trash2 } from 'lucide-react';

interface PlanHeaderProps {
  program: WorkoutProgram;
  onDownloadPdf: () => void;
  onOpenShare: () => void;
  onClearProgram?: () => void;
  isGeneratingPdf?: boolean;
}

const titleCase = (s: string) =>
  s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/** Program title over a photo, with its key facts as pills and the plan actions below. */
export function PlanHeader({
  program,
  onDownloadPdf,
  onOpenShare,
  onClearProgram,
  isGeneratingPdf = false,
}: PlanHeaderProps) {
  const profile = program.userProfile;
  const hasInjuries = profile.injuries && profile.injuries.length > 0 && !profile.injuries.includes('none');

  const facts = [
    `${program.days.length} days a week`,
    `${profile.duration} min`,
    titleCase(profile.experience),
    ...(profile.secondaryGoals ?? []).map((g) => `+ ${titleCase(g)}`),
  ];

  return (
    <header className="on-photo relative isolate overflow-hidden rounded-[32px]">
      <Image src="/images/training-weights.jpg" alt="" fill priority sizes="(max-width: 1152px) 100vw, 1152px" className="-z-20 object-cover" />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'linear-gradient(180deg, rgba(7,9,13,0.4) 0%, rgba(7,9,13,0.55) 45%, rgba(7,9,13,0.9) 100%)' }}
      />

      <div className="space-y-5 p-5 pt-24 sm:p-8 sm:pt-32">
        <div>
          <p className="text-[13px] font-semibold text-gym-lime">Your program</p>
          <h1 className="t-large mt-1 break-words">{program.name}</h1>
          <p className="mt-1.5 text-[15px] text-white/85">{program.description}</p>
        </div>

        <ul className="flex flex-wrap gap-2 text-[13px] font-medium" aria-label="Program details">
          {facts.map((fact) => (
            <li key={fact} className="glass-inset rounded-full px-3 py-2">
              {fact}
            </li>
          ))}
        </ul>

        {hasInjuries && (
          <div className="glass-inset flex items-start gap-3 rounded-3xl p-4 text-sm">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div className="space-y-0.5">
              <p className="font-semibold">Protecting: {profile.injuries.map((i) => i.replace('_', ' ')).join(', ')}</p>
              <p className="leading-relaxed text-white/80">
                Exercises that strain these joints were swapped for safer alternatives.
                {profile.injuryNotes && <span className="mt-1 block italic">“{profile.injuryNotes}”</span>}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            className="tap flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-gym-ink disabled:opacity-60"
          >
            <FileDown className="h-4 w-4" />
            {isGeneratingPdf ? 'Generating PDF…' : 'Download PDF'}
          </button>
          <button type="button" onClick={onOpenShare} className="glass-btn !min-h-[48px] gap-2 px-4 text-sm font-semibold">
            <QrCode className="h-4 w-4" /> Send to phone
          </button>
          <Link href="/questionnaire" className="glass-btn !min-h-[48px] !min-w-[48px]" title="Edit answers" aria-label="Edit answers">
            <RotateCcw className="h-[18px] w-[18px]" />
          </Link>
          {onClearProgram && (
            <button type="button" onClick={onClearProgram} className="glass-btn !min-h-[48px] !min-w-[48px]" title="Clear program" aria-label="Clear program">
              <Trash2 className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
