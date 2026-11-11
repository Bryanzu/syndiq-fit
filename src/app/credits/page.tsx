import React from 'react';
import { PHOTO_CREDITS } from '@/data/photoCredits';

export const metadata = { title: 'Photo credits · Syndiq Fit' };

export default function CreditsPage() {
  return (
    <div className="page max-w-3xl space-y-6 pb-10 pt-1 sm:py-10">
      <header className="space-y-1.5">
        <h1 className="t-large">Photo credits</h1>
        <p className="t-small">
          Exercise and meal photos come from Wikimedia Commons and are used under the licence shown. Each has been cropped
          and resized.
        </p>
      </header>
      <ul className="divide-line">
        {PHOTO_CREDITS.map((c) => (
          <li key={c.file} className="py-3">
            <a href={c.source} target="_blank" rel="noopener noreferrer" className="text-[15px] font-semibold text-gym-text hover:underline">
              {c.title}
            </a>
            <p className="t-small !text-xs">
              {c.artist} · {c.licence}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
