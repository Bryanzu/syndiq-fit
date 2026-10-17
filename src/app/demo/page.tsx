import React from 'react';
import Link from 'next/link';
import { Play, Download, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Dumbbell, ArrowLeft } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-gym-lime transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gym-lime/10 border border-gym-lime/30 text-[11px] font-bold text-gym-lime mb-2">
              <Sparkles className="w-3.5 h-3.5 fill-gym-lime" />
              <span>OFFICIAL PRODUCT WALKTHROUGH</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Syndiq Fit Video Demo
            </h1>
          </div>
          <a
            href="/api/video"
            download="syndiq-fit-demo.webm"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-xs sm:text-sm shadow-lime-sm transition-all hover:scale-105 shrink-0 min-h-[44px]"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download Video (.webm)</span>
          </a>
        </div>
        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Watch the end-to-end walkthrough demonstrating female body visualization, flexible equipment configuration, deterministic workout assembly, and intelligent exercise replacement.
        </p>
      </div>

      {/* Video Player Card */}
      <div className="relative rounded-3xl overflow-hidden bg-black border border-gym-border shadow-2xl">
        <video
          controls
          autoPlay
          muted
          playsInline
          className="w-full aspect-[16/10] bg-black object-contain"
          src="/api/video"
        >
          Your browser does not support the video tag. You can download the video using the link above.
        </video>
      </div>

      {/* Walkthrough Chapters / Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-[#121212] border border-gym-border space-y-3">
          <div className="flex items-center gap-2 text-gym-lime font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>1. Tailored Equipment Rebranding</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Demonstrates the new branding across the landing page, showing that Syndiq Fit adapts to whatever equipment you have available across 6 core categories.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#121212] border border-gym-border space-y-3">
          <div className="flex items-center gap-2 text-gym-lime font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>2. Female Profile & Flexible Equipment Selector</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Walks through the questionnaire with female selection, testing quick presets (&quot;Home Dumbbells&quot; and &quot;Commercial Gym&quot;), category tabs, and real-time alias search.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#121212] border border-gym-border space-y-3">
          <div className="flex items-center gap-2 text-gym-lime font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>3. Generated Program & Female Muscle Map</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Verifies that the generated program automatically renders the female anatomical silhouette without showing any male/female toggle switcher. Exercise hovers highlight active muscles dynamically.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#121212] border border-gym-border space-y-3">
          <div className="flex items-center gap-2 text-gym-lime font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>4. Exercise Replacement & Standalone Map</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Demonstrates swapping an exercise with duplicate prevention, and tests the standalone muscle map where interactive Male/Female switching remains available.
          </p>
        </div>
      </div>

      {/* Try It CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-zinc-900 to-[#141414] border border-gym-lime/40 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black text-white">Experience It Live</h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Generate your own custom workout plan matched to your gym and goals.
          </p>
        </div>
        <Link
          href="/questionnaire"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-sm shadow-lime-md transition-all hover:scale-105 shrink-0 min-h-[48px]"
        >
          <span>Start Questionnaire</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </Link>
      </div>
    </div>
  );
}
