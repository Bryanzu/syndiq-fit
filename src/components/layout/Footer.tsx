import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full mt-8 pb-28 lg:pb-10 pt-10">
      <div className="page flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm space-y-2">
          <p className="text-sm font-semibold tracking-[0.08em] text-gym-text">
            SYNDIQ <span className="text-gym-limeDark dark:text-gym-lime">FIT</span>
          </p>
          <p className="t-small leading-relaxed">
            Rule-based training programs matched to your equipment, experience and goals. Fitness guidance for healthy
            individuals — stop and seek advice if you feel sharp pain.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gym-textMuted">
          <Link href="/about" className="hover:text-gym-text transition-colors py-1">About</Link>
          <Link href="/disclaimer" className="hover:text-gym-text transition-colors py-1">Disclaimer</Link>
          <Link href="/settings" className="hover:text-gym-text transition-colors py-1">Settings</Link>
          <Link href="/feedback" className="hover:text-gym-text transition-colors py-1">Feedback</Link>
        </nav>
      </div>
      <p className="page mt-6 text-xs text-gym-textMuted">© {new Date().getFullYear()} Syndiq Fit</p>
    </footer>
  );
}
