'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, Sparkles, Activity, Info } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'My Workout',
      href: '/program',
      icon: Dumbbell,
      isActive: pathname === '/program',
    },
    {
      label: 'Generate',
      href: '/questionnaire',
      icon: Sparkles,
      isActive: pathname === '/questionnaire',
      isCenterAction: true,
    },
    {
      label: 'Muscle Map',
      href: '/muscle-map',
      icon: Activity,
      isActive: pathname === '/muscle-map',
    },
    {
      label: 'About',
      href: '/about',
      icon: Info,
      isActive: pathname === '/about' || pathname === '/disclaimer',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-zinc-200 dark:border-[#222222] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCenterAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5 group"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lime-md transition-all duration-200 ${
                    item.isActive
                      ? 'bg-gym-limeLight text-black scale-105 ring-4 ring-white dark:ring-black'
                      : 'bg-gym-lime text-black hover:scale-105 ring-4 ring-white dark:ring-black'
                  }`}
                >
                  <Icon className="w-5 h-5 fill-black stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-bold text-zinc-900 dark:text-white mt-1 tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[48px] rounded-xl transition-all ${
                item.isActive
                  ? 'text-gym-lime font-bold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    item.isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gym-lime" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
