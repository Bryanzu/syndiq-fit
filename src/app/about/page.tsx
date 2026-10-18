import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Dumbbell, ShieldCheck, Award, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-gym-lime shadow-lime-md bg-zinc-900 dark:bg-black p-1">
          <Image
            src="/syndiq-logo.png"
            alt="Syndiq fit Logo"
            fill
            className="object-contain"
          />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gym-limeDark dark:text-gym-lime">
            Smart Workout Engineering
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
            About Syndiq fit
          </h1>
        </div>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Syndiq fit was engineered to replace arbitrary gym workouts with deterministic, evidence-based exercise programming grounded in real sports science.
        </p>
      </div>

      {/* Philosophy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gym-card border border-gym-border shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center text-gym-limeDark dark:text-gym-lime">
            <Dumbbell className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">Full-Body Structural Balance</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Every program ensures agonist and antagonist muscle groups are trained in optimal ratios, protecting shoulders, knees, and lower backs from chronic imbalance.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gym-card border border-gym-border shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center text-gym-limeDark dark:text-gym-lime">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">Injury-Aware Adaptations</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We reject the idea that pain is required for progress. If a lifter has a restricted joint, our engine swaps high-strain movements for joint-friendly alternatives.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gym-card border border-gym-border shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center text-gym-limeDark dark:text-gym-lime">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">Equipment-Aware Customization</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Workouts tailored to your gym. Every gym has different equipment. Syndiq Fit lets you select the equipment available to you and generates workout programs tailored to your goals, experience, available equipment, and training time.
          </p>
        </div>
      </div>

      {/* Equipment Compatibility */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gym-card border border-gym-border shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">Workouts Tailored to Any Gym</h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Syndiq Fit works with whatever training setup you have access to across 6 core equipment categories:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-gym-border space-y-1">
            <div className="flex items-center gap-2 text-gym-limeDark dark:text-gym-lime font-bold">
              <span className="w-2 h-2 rounded-full bg-gym-lime shrink-0" />
              <span>Free Weights</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Olympic barbells, EZ bars, weight plates, dumbbell sets, and kettlebells.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-gym-border space-y-1">
            <div className="flex items-center gap-2 text-gym-limeDark dark:text-gym-lime font-bold">
              <span className="w-2 h-2 rounded-full bg-gym-lime shrink-0" />
              <span>Benches & Racks</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Power racks, squat stands, flat/incline adjustable benches, and Smith machines.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-gym-border space-y-1">
            <div className="flex items-center gap-2 text-gym-limeDark dark:text-gym-lime font-bold">
              <span className="w-2 h-2 rounded-full bg-gym-lime shrink-0" />
              <span>Resistance Machines</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Leg press, hack squat, leg extension/curl, chest press, and shoulder press machines.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-gym-border space-y-1">
            <div className="flex items-center gap-2 text-gym-limeDark dark:text-gym-lime font-bold">
              <span className="w-2 h-2 rounded-full bg-gym-lime shrink-0" />
              <span>Cable Columns & Pulleys</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Functional trainers, single/dual cable crossovers, and lat pulldown towers.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-gym-border space-y-1">
            <div className="flex items-center gap-2 text-gym-limeDark dark:text-gym-lime font-bold">
              <span className="w-2 h-2 rounded-full bg-gym-lime shrink-0" />
              <span>Bodyweight & Functional</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Pull-up bars, dip stations, gymnastic rings, resistance bands, and yoga mats.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-gym-border space-y-1">
            <div className="flex items-center gap-2 text-gym-limeDark dark:text-gym-lime font-bold">
              <span className="w-2 h-2 rounded-full bg-gym-lime shrink-0" />
              <span>Cardiovascular Stations</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Treadmills, stationary upright bikes, rowing ergometers, and speed jump ropes.</p>
          </div>
        </div>
      </div>

      {/* CTA Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-zinc-100 to-zinc-200/80 dark:from-zinc-900 dark:to-[#161616] border border-gym-lime/40 text-center space-y-4">
        <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">Get Your Custom Workout Program</h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Take our 2-minute questionnaire and receive a personalized program matched to your schedule and goals.
        </p>
        <Link
          href="/questionnaire"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-sm shadow-lime-md transition-all hover:scale-105 min-h-[48px]"
        >
          <span>Start Questionnaire</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
