'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Moon, Sun, ChevronRight, Trash2, RotateCcw } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import {
  ARCHIVE_KEEP_DAYS,
  ArchivedProgram,
  archiveDaysLeft,
  clearActiveProgram,
  deleteArchivedProgram,
  hasActiveProgram,
  loadProgramArchive,
  restoreArchivedProgram,
} from '@/lib/storage';
import { clearWorkoutLog, loadWorkoutLog } from '@/lib/progress';

const DATA_KEYS = ['syndiq_active_program', 'syndiq_active_profile', 'syndiq_meal_plan', 'syndiq_meal_inventory', 'syndiq_workout_log', 'syndiq_program_archive'];

function ConfirmAction({
  label,
  description,
  confirmLabel,
  onConfirm,
  disabled,
}: {
  label: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <div className="row justify-between flex-wrap gap-y-3">
      <div className="min-w-0 flex-1 basis-56">
        <p className="text-sm sm:text-base font-medium text-gym-text">{label}</p>
        <p className="t-small">{description}</p>
      </div>
      {armed ? (
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost btn-sm" onClick={() => setArmed(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger btn-sm"
            onClick={() => {
              onConfirm();
              setArmed(false);
            }}
          >
            <Trash2 className="w-4 h-4" /> {confirmLabel}
          </button>
        </div>
      ) : (
        <button type="button" className="btn-secondary btn-sm" disabled={disabled} onClick={() => setArmed(true)}>
          {label.split(' ')[0]}
        </button>
      )}
    </div>
  );
}

function PreviousProgram({
  entry,
  onRestore,
  onDelete,
}: {
  entry: ArchivedProgram;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const [armed, setArmed] = useState(false);
  const replaced = new Date(entry.archivedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const left = archiveDaysLeft(entry);
  return (
    <li className="row justify-between flex-wrap gap-y-3">
      <div className="min-w-0 flex-1 basis-56">
        <p className="text-sm sm:text-base font-medium text-gym-text">{entry.program.name}</p>
        <p className="t-small">
          Replaced {replaced} · deleted in {left} day{left === 1 ? '' : 's'}
        </p>
      </div>
      {armed ? (
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost btn-sm" onClick={() => setArmed(false)}>
            Cancel
          </button>
          <button type="button" className="btn-danger btn-sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" /> Delete now
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary btn-sm" onClick={onRestore}>
            <RotateCcw className="w-4 h-4" /> Restore
          </button>
          <button type="button" className="btn-icon" aria-label={`Delete ${entry.program.name}`} onClick={() => setArmed(true)}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </li>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [hasProgram, setHasProgram] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [archive, setArchive] = useState<ArchivedProgram[]>([]);
  const [note, setNote] = useState('');

  const refresh = () => {
    setHasProgram(hasActiveProgram());
    setSessions(loadWorkoutLog().length);
    setArchive(loadProgramArchive());
  };
  useEffect(refresh, []);

  const done = (msg: string) => {
    setNote(msg);
    refresh();
  };

  return (
    <div className="page py-8 sm:py-12 max-w-3xl animate-fadeIn">
      <h1 className="t-title">Settings</h1>
      <p className="t-body mt-2">Everything is stored on this device. Nothing is sent anywhere.</p>

      <section className="mt-10" aria-labelledby="appearance">
        <h2 id="appearance" className="t-eyebrow mb-2">Appearance</h2>
        <div className="row justify-between">
          <div>
            <p className="text-sm sm:text-base font-medium text-gym-text">Theme</p>
            <p className="t-small">Dark is the default. Your choice is remembered.</p>
          </div>
          <div role="radiogroup" aria-label="Theme" className="flex rounded-full bg-gym-cardInner p-1">
            {([['dark', 'Dark', Moon], ['light', 'Light', Sun]] as const).map(([val, label, Icon]) => (
              <button
                key={val}
                type="button"
                role="radio"
                aria-checked={theme === val}
                onClick={() => setTheme(val)}
                className={`tab ${theme === val ? 'tab-active' : ''}`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="previous">
        <h2 id="previous" className="t-eyebrow mb-2">Previous programs</h2>
        {archive.length ? (
          <ul className="divide-line">
            {archive.map((entry) => (
              <PreviousProgram
                key={entry.program.id}
                entry={entry}
                onRestore={() => {
                  restoreArchivedProgram(entry.program.id);
                  done(`${entry.program.name} is your program again.`);
                }}
                onDelete={() => {
                  deleteArchivedProgram(entry.program.id);
                  done('Previous program deleted.');
                }}
              />
            ))}
          </ul>
        ) : (
          <p className="t-small py-2">Programs you replace are kept here for {ARCHIVE_KEEP_DAYS} days.</p>
        )}
      </section>

      <section className="mt-10" aria-labelledby="data">
        <h2 id="data" className="t-eyebrow mb-2">Your data</h2>
        <div className="divide-line">
          <ConfirmAction
            label="Clear workout program"
            description={hasProgram ? 'Removes your active schedule. Questionnaire answers and meal plans are kept.' : 'No active program on this device.'}
            confirmLabel="Clear program"
            disabled={!hasProgram}
            onConfirm={() => {
              clearActiveProgram();
              done('Active program cleared.');
            }}
          />
          <ConfirmAction
            label="Clear workout history"
            description={sessions ? `${sessions} completed session${sessions === 1 ? '' : 's'} logged.` : 'No completed sessions logged yet.'}
            confirmLabel="Clear history"
            disabled={!sessions}
            onConfirm={() => {
              clearWorkoutLog();
              done('Workout history cleared.');
            }}
          />
          <ConfirmAction
            label="Reset all app data"
            description="Program, answers, meal plan, pantry and history. Feedback you submitted is not affected."
            confirmLabel="Reset everything"
            onConfirm={() => {
              DATA_KEYS.forEach((k) => localStorage.removeItem(k));
              done('All app data reset.');
            }}
          />
        </div>
        {note && (
          <p role="status" className="mt-3 text-sm text-gym-limeDark dark:text-gym-lime">
            {note}
          </p>
        )}
      </section>

      <section className="mt-10" aria-labelledby="more">
        <h2 id="more" className="t-eyebrow mb-2">More</h2>
        <ul className="divide-line">
          {[
            ['/feedback', 'Send feedback', 'Report a bug or suggest an improvement'],
            ['/about', 'About Syndiq Fit', 'How programs are built'],
            ['/disclaimer', 'Health disclaimer', 'Important safety information'],
            ['/demo', 'Product demo', 'Watch a walkthrough'],
          ].map(([href, label, sub]) => (
            <li key={href}>
              <Link href={href} className="row-link">
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-medium text-gym-text">{label}</p>
                  <p className="t-small">{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gym-textMuted" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
