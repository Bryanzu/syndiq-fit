import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Dumbbell,
  Clock,
  Layers,
  FileDown,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { SYNDIQ_DEFAULT_EQUIPMENT } from '@/data/equipment';

export default function HomePage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gym-lime/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-[#141414] border border-gym-lime/50 text-xs font-bold text-gym-limeDark dark:text-gym-lime mb-8 shadow-lime-sm animate-fadeIn">
          <Sparkles className="w-4 h-4 fill-gym-limeDark dark:fill-gym-lime" />
          <span>SYNDIQ FIT — OFFICIAL WORKOUT PLATFORM</span>
        </div>

        {/* Hero Logo Emblem */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-gym-lime/50 shadow-lime-md mb-8 bg-zinc-900 dark:bg-black p-1">
          <Image
            src="/syndiq-logo.png"
            alt="Syndiq fit Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-zinc-900 dark:text-white tracking-tight max-w-4xl leading-[1.08] mb-6">
          Precision Workout Programs{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gym-lime via-gym-limeLight to-emerald-400">
            Engineered For You.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mb-10">
          Stop guessing in the gym. Get a fully balanced, custom program tailored to your fitness goals, experience level, injury limitations, and verified gym equipment.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/questionnaire"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gym-lime hover:bg-gym-limeLight text-black font-black text-base shadow-lime-md transition-all hover:scale-105 flex items-center justify-center gap-2.5 min-h-[48px]"
          >
            <span>Create Your Program</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </Link>
          <Link
            href="/muscle-map"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-base border border-zinc-300 dark:border-zinc-700 transition-colors flex items-center justify-center gap-2 min-h-[48px] shadow-sm"
          >
            <Activity className="w-5 h-5 text-gym-limeDark dark:text-gym-lime" />
            <span>Explore Muscle Map</span>
          </Link>
        </div>

        {/* Quick Highlights Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-16 w-full max-w-4xl pt-8 border-t border-gym-border/60 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-gym-limeDark dark:text-gym-lime shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white block">113 Exercises</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Curated & Tested</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-gym-limeDark dark:text-gym-lime shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white block">Injury Smart</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Auto Joint Swaps</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-gym-limeDark dark:text-gym-lime shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white block">Any Gym Setup</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Tailored Equipment</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-gym-limeDark dark:text-gym-lime shrink-0">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white block">PDF Export</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Save & Print</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW SYNDIQ FIT WORKS */}
      <section className="w-full bg-zinc-100/70 dark:bg-[#0d0d0d] border-y border-gym-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-gym-lime">
              Structured Fitness System
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Why Syndiq fit Delivers Superior Workouts
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We replaced generic AI hallucinations with a deterministic, slot-based fitness engine built on sports science.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-gym-card border border-gym-border hover:border-gym-lime/40 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center text-gym-limeDark dark:text-gym-lime font-black text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Full-Body Balance First</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Even if your priority is "Bigger Chest" or "Glute Focus", Syndiq fit ensures you still train your back, shoulders, legs, and core in optimal ratios to avoid posture imbalances.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gym-card border border-gym-border hover:border-gym-lime/40 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center text-gym-limeDark dark:text-gym-lime font-black text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Equipment-Aware Selection</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Workouts tailored to your gym. Every gym has different equipment. Syndiq Fit lets you select the equipment available to you and generates workout programs tailored to your goals, experience, available equipment, and training time.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gym-card border border-gym-border hover:border-gym-lime/40 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center text-gym-limeDark dark:text-gym-lime font-black text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Biomechanic Safety Badges</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Got a bad knee, tight shoulder, or lower back irritation? Movements loading those joints are replaced with safe compound variations and tagged with transparency badges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORTED EQUIPMENT LIBRARY SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-gym-limeDark dark:text-gym-lime">
              Flexible Equipment Support
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Workouts Tailored to Your Gym
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              From full commercial fitness clubs to home barbell and dumbbell corners, Syndiq Fit adapts exercises to match the exact gear you have access to.
            </p>
          </div>
          <Link
            href="/questionnaire"
            className="text-xs sm:text-sm font-bold text-gym-limeDark dark:text-gym-lime hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Select your gym equipment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SYNDIQ_DEFAULT_EQUIPMENT.slice(0, 16).map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-gym-card border border-gym-border shadow-sm flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-gym-limeDark dark:text-gym-lime shrink-0 mt-0.5" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white block">{item.name}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{item.category.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="w-full bg-gradient-to-b from-zinc-100 to-zinc-200/80 dark:from-[#111111] dark:to-[#080808] border-t border-gym-border py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
            Ready to Build Your Program?
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Answer 8 simple questions about your fitness level, goals, and schedule to receive your complete personalized workout plan in seconds.
          </p>
          <div className="pt-2">
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl bg-gym-lime hover:bg-gym-limeLight text-black font-black text-base shadow-lime-lg transition-all hover:scale-105 min-h-[48px]"
            >
              <Sparkles className="w-5 h-5 fill-black" />
              <span>Get Started Now</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
