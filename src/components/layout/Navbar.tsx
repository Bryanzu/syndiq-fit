'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Sparkles } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gym-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-gym-lime/40 shadow-lime-sm group-hover:scale-105 transition-transform bg-black flex items-center justify-center p-1">
              <Image
                src="/syndiq-logo.png"
                alt="Syndiq fit Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-wider text-white group-hover:text-gym-lime transition-colors">
                  SYNDIQ
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-wider text-gym-lime">
                  FIT
                </span>
              </div>
              <span className="text-[11px] font-bold tracking-[0.25em] text-zinc-400 uppercase">
                INTELLIGENT TRAINING
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-300">
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
            <Link href="/about" className="hover:text-gym-lime transition-colors">
              About
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/questionnaire"
              className="px-5 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-xs sm:text-sm shadow-lime-sm transition-all hover:scale-105 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Start Questionnaire</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#0d0d0d] border-b border-gym-border px-5 py-6 space-y-4 animate-fadeIn">
          <div className="flex flex-col space-y-2 font-bold text-sm sm:text-base text-zinc-300">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-800 hover:text-gym-lime transition-colors"
            >
              Home
            </Link>
            <Link
              href="/questionnaire"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-800 hover:text-gym-lime transition-colors"
            >
              Create Program
            </Link>
            <Link
              href="/program"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-800 hover:text-gym-lime transition-colors"
            >
              My Program
            </Link>
            <Link
              href="/muscle-map"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-800 hover:text-gym-lime transition-colors"
            >
              Muscle Map
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-800 hover:text-gym-lime transition-colors"
            >
              About Syndiq fit
            </Link>
            <Link
              href="/disclaimer"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-3 min-h-[44px] flex items-center rounded-xl hover:bg-zinc-800 hover:text-gym-lime text-xs sm:text-sm text-zinc-400 transition-colors"
            >
              Health Disclaimer
            </Link>
          </div>
          <div className="pt-2">
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
