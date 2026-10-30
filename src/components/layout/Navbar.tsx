'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-zinc-200 dark:border-gym-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 shrink">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border border-gym-lime/40 shadow-lime-sm group-hover:scale-105 transition-transform bg-black flex items-center justify-center p-1 shrink-0">
              <Image
                src="/syndiq-logo.png"
                alt="Syndiq fit Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-2xl font-black tracking-wider text-zinc-900 dark:text-white group-hover:text-gym-lime transition-colors truncate">
                  SYNDIQ
                </span>
                <span className="text-base sm:text-2xl font-black tracking-wider text-gym-lime">
                  FIT
                </span>
              </div>
              <span className="hidden sm:block text-[10px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.25em] text-zinc-500 dark:text-zinc-400 uppercase truncate">
                INTELLIGENT TRAINING
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs xl:text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            <Link href="/" className="hover:text-gym-lime transition-colors">
              Home
            </Link>
            <Link href="/questionnaire" className="hover:text-gym-lime transition-colors">
              Create Program
            </Link>
            <Link href="/program" className="hover:text-gym-lime transition-colors">
              My Program
            </Link>
            <Link href="/muscle-map" className="hover:text-gym-lime transition-colors">
              Muscle Map
            </Link>
            <Link href="/meal-planner" className="hover:text-gym-lime transition-colors">
              Meal Planner
            </Link>
            <Link href="/feedback" className="hover:text-gym-lime transition-colors">
              Feedback
            </Link>
            <Link href="/about" className="hover:text-gym-lime transition-colors">
              About
            </Link>
          </div>

          {/* Desktop CTA & Theme Toggle */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <Link
              href="/questionnaire"
              className="px-4 xl:px-5 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-xs sm:text-sm shadow-lime-sm transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Start Questionnaire</span>
            </Link>
          </div>

          {/* Mobile Actions (Theme Toggle & Menu Trigger) */}
          <div className="flex items-center gap-2 lg:hidden shrink-0">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0d0d0d] border-b border-zinc-200 dark:border-gym-border px-5 py-6 space-y-4 animate-fadeIn shadow-xl">
          <div className="flex flex-col space-y-2 font-bold text-sm sm:text-base text-zinc-700 dark:text-zinc-300">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-gym-lime transition-colors"
            >
              Home
            </Link>
            <Link
              href="/questionnaire"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-gym-lime transition-colors"
            >
              Create Program
            </Link>
            <Link
              href="/program"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-gym-lime transition-colors"
            >
              My Program
            </Link>
            <Link
              href="/muscle-map"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-gym-lime transition-colors"
            >
              Muscle Map
            </Link>
            <Link
              href="/meal-planner"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-gym-lime transition-colors"
            >
              Meal Planner
            </Link>
            <Link
              href="/feedback"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-gym-lime transition-colors"
            >
              Send Feedback
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-gym-lime transition-colors"
            >
              About Syndiq fit
            </Link>
            <Link
              href="/disclaimer"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-gym-lime text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 transition-colors"
            >
              Health Disclaimer
            </Link>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Appearance</span>
              <ThemeToggle showLabel />
            </div>
            <Link
              href="/questionnaire"
              onClick={() => setIsOpen(false)}
              className="w-full py-3.5 min-h-[48px] rounded-xl bg-gym-lime text-black font-black text-sm flex items-center justify-center gap-2 shadow-lime-sm"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Start Questionnaire</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
