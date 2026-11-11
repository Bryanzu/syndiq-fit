import React from 'react';
import Link from 'next/link';
import { Download, ArrowRight } from 'lucide-react';

const CHAPTERS: [string, string][] = [
  ['Build a program', 'Eight questions: your goal, schedule, equipment and any injuries.'],
  ['Your week', 'Every training day laid out. Open an exercise, or swap one you don’t like.'],
  ['Train', 'Follow the session set by set, log the weight, and rest on a timer.'],
  ['Body map and meals', 'See which muscles you’ve worked, then plan a week of Nigerian food.'],
];

export default function DemoPage() {
  return (
    <div className="page max-w-5xl space-y-8 pb-10 pt-1 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="t-large">See it in action</h1>
          <p className="t-small max-w-xl">A 90-second walkthrough, from the first question to a finished set.</p>
        </div>
        <a href="/api/video" download="syndiq-fit-demo.webm" className="btn-secondary shrink-0 self-start sm:self-auto">
          <Download className="h-4 w-4" /> Download video
        </a>
      </header>

      <div className="overflow-hidden rounded-[32px] bg-black">
        <video controls autoPlay muted playsInline className="aspect-[16/10] w-full bg-black object-contain" src="/api/video">
          Your browser can’t play this video. Use the download link above.
        </video>
      </div>

      <ol className="stagger grid gap-4 md:grid-cols-2">
        {CHAPTERS.map(([title, body], i) => (
          <li key={title} className="surface flex gap-4 !rounded-3xl p-5" style={{ '--i': i } as React.CSSProperties}>
            <span className="text-3xl font-bold tabular-nums tracking-tight text-gym-limeDark dark:text-gym-lime">{i + 1}</span>
            <div className="space-y-1">
              <h2 className="t-section">{title}</h2>
              <p className="t-small leading-relaxed">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="glass flex flex-col items-center justify-between gap-5 rounded-[32px] p-6 sm:flex-row sm:p-8">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-xl font-bold tracking-tight text-gym-text sm:text-2xl">Try it yourself</h2>
          <p className="t-small">Two minutes. No account needed.</p>
        </div>
        <Link href="/questionnaire" className="btn-primary !min-h-[52px] shrink-0 px-7">
          Build my program <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
