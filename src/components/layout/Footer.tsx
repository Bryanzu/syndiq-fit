import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Dumbbell, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#070707] border-t border-gym-border text-zinc-400 text-xs sm:text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-gym-lime/40 shadow-lime-sm bg-black flex items-center justify-center p-1">
                <Image
                  src="/syndiq-logo.png"
                  alt="Syndiq fit Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tracking-wider text-white">
                    SYNDIQ
                  </span>
                  <span className="text-lg sm:text-xl font-black tracking-wider text-gym-lime">
                    FIT
                  </span>
                </div>
                <span className="block text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">
                  INTELLIGENT TRAINING
                </span>
              </div>
            </div>
            <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
              Precision workout programming system for lifters. Built on exercise science, verified equipment matching, and customized injury adaptations.
            </p>
            <div className="flex items-center gap-2 text-zinc-500 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-gym-lime shrink-0" />
              <span>Syndiq fit — Next-Generation Fitness Platform</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5 font-medium text-xs sm:text-sm">
              <li>
                <Link href="/" className="hover:text-gym-lime transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/questionnaire" className="hover:text-gym-lime transition-colors">
                  Create Workout Program
                </Link>
              </li>
              <li>
                <Link href="/program" className="hover:text-gym-lime transition-colors">
                  View Active Program
                </Link>
              </li>
              <li>
                <Link href="/muscle-map" className="hover:text-gym-lime transition-colors">
                  Interactive Muscle Map
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gym-lime transition-colors">
                  About Syndiq fit
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Health & Safety</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/disclaimer" className="hover:text-gym-lime transition-colors flex items-center gap-1.5 font-semibold text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-gym-lime" />
                  <span>Medical Disclaimer</span>
                </Link>
              </li>
              <li className="text-xs text-zinc-400 leading-relaxed">
                Syndiq fit provides fitness guidance for healthy individuals. If you experience sharp pain, stop immediately and consult a healthcare provider.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 border-t border-gym-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400 text-xs sm:text-sm">
          <p>© {new Date().getFullYear()} Syndiq fit. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/disclaimer" className="hover:text-zinc-300">
              Disclaimer
            </Link>
            <Link href="/about" className="hover:text-zinc-300">
              Platform Info
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
