import type { ComponentType } from 'react';
import { Home, Dumbbell, Sparkles, Utensils, Activity, MessageSquare } from 'lucide-react';

type LucideIcon = ComponentType<{ className?: string; strokeWidth?: number }>;

export interface NavItem {
  id: string;
  label: string;
  /** Shorter label for the mobile tab bar, where space is tight */
  shortLabel?: string;
  href: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
}

/** Single source of truth for both the desktop top bar and the mobile tab bar. */
export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '/', icon: Home, match: (p) => p === '/' },
  { id: 'workout', label: 'Workout', href: '/program', icon: Dumbbell, match: (p) => p.startsWith('/program') },
  { id: 'create', label: 'Create', href: '/questionnaire', icon: Sparkles, match: (p) => p.startsWith('/questionnaire') },
  { id: 'meals', label: 'Meals', href: '/meal-planner', icon: Utensils, match: (p) => p.startsWith('/meal-planner') },
  { id: 'muscles', label: 'Muscle Map', shortLabel: 'Muscles', href: '/muscle-map', icon: Activity, match: (p) => p.startsWith('/muscle-map') },
  { id: 'feedback', label: 'Feedback', href: '/feedback', icon: MessageSquare, match: (p) => p.startsWith('/feedback') },
];

/** The five sections shown in the mobile tab bar. Feedback lives in the header on phones. */
export const TAB_ITEMS: NavItem[] = NAV_ITEMS.filter((i) => i.id !== 'feedback');

/** Tailwind `lg` breakpoint: desktop navigation at and above this width, mobile tab bar below it. */
export const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';
