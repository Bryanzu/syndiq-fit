'use client';

import React from 'react';
import { MuscleGroup } from '@/types/workout';

export type BodyView = 'front' | 'back';
export type BodyBuild = 'male' | 'female';

interface BodyFigureProps {
  view: BodyView;
  /** Body proportions. Defaults to male. */
  build?: BodyBuild;
  selected: MuscleGroup | null;
  /** 0–1 per muscle: how hard it has been worked. Missing or 0 means untouched. */
  intensity?: Partial<Record<MuscleGroup, number>>;
  onSelect?: (muscle: MuscleGroup) => void;
  /** False for a display-only figure (no tapping, no keyboard focus) */
  interactive?: boolean;
  className?: string;
}

/** Shapes are drawn for the viewer's left half and mirrored across x = 120. */
interface Shape {
  muscle?: MuscleGroup;
  d: string;
  /** Part of an arm: keeps the shoulder width all the way down instead of following the hips */
  arm?: boolean;
}

const MIRROR = 'matrix(-1 0 0 1 240 0)';

const SILHOUETTE_CENTRE: Shape[] = [
  { d: 'M120 8 C135 8 142 21 141 37 C140 52 133 66 120 69 C107 66 100 52 99 37 C98 21 105 8 120 8 Z' },
  { d: 'M107 58 L106 84 C114 92 126 92 134 84 L133 58 Z' },
  { d: 'M106 78 C94 88 76 90 63 98 L70 130 C72 150 78 170 84 188 C81 202 77 216 76 232 C76 246 82 256 92 262 L120 266 L148 262 C158 256 164 246 164 232 C163 216 159 202 156 188 C162 170 168 150 170 130 L177 98 C164 90 146 88 134 78 Z' },
];

const SILHOUETTE_HALF: Shape[] = [
  { d: 'M65 93 C52 95 45 108 46 124 C44 150 41 180 39 204 L62 207 C66 182 70 152 73 128 C75 110 73 97 65 93 Z', arm: true },
  { d: 'M39 200 C33 216 31 238 33 258 L32 276 L47 278 C54 256 60 232 63 204 Z', arm: true },
  { d: 'M32 274 C28 286 27 300 30 312 C33 321 42 321 45 312 C48 300 49 287 47 276 Z', arm: true },
  { d: 'M76 228 C70 256 70 300 78 340 C80 352 82 362 83 372 C80 386 79 404 82 424 C85 444 89 462 90 478 L104 478 C105 460 108 440 109 420 C110 402 108 386 107 372 C108 356 112 330 116 300 C118 284 119 272 119 258 Z' },
  { d: 'M89 476 C84 486 80 494 78 499 C81 504 100 504 104 499 C106 491 105 483 104 476 Z' },
];

const ARM_UPPER = 'M53 135 C47 151 46 172 49 192 C54 197 60 195 63 189 C66 171 67 151 64 137 C60 133 56 133 53 135 Z';
const FOREARM = 'M41 207 C36 221 35 240 37 257 C41 263 47 261 50 255 C55 240 58 223 60 209 C54 205 46 204 41 207 Z';
const DELT_OUTER = 'M66 93 C54 94 46 106 47 122 C48 130 52 136 56 138 C55 124 58 106 66 93 Z';
const DELT_INNER = 'M66 93 C58 106 55 124 56 138 C60 128 68 118 76 112 C78 104 74 95 66 93 Z';
const KNEE = 'M95 364 C100 364 104 368 104 372 C104 376 100 380 95 380 C90 380 86 376 86 372 C86 368 90 364 95 364 Z';

const ab = (y: number, h: number) =>
  `M103 ${y} L113 ${y} Q118 ${y} 118 ${y + 5} L118 ${y + h - 5} Q118 ${y + h} 113 ${y + h} L103 ${y + h} Q98 ${y + h} 98 ${y + h - 5} L98 ${y + 5} Q98 ${y} 103 ${y} Z`;

const FRONT: Shape[] = [
  { muscle: 'traps', d: 'M108 70 C104 80 92 87 78 92 C90 94 102 93 110 88 Z' },
  { muscle: 'side_delts', d: DELT_OUTER, arm: true },
  { muscle: 'front_delts', d: DELT_INNER, arm: true },
  { muscle: 'chest', d: 'M80 100 C92 96 108 96 118 100 L118 138 C110 146 96 148 84 142 C76 136 72 124 74 114 C76 108 78 103 80 100 Z' },
  { muscle: 'biceps', d: ARM_UPPER, arm: true },
  { muscle: 'forearms', d: FOREARM, arm: true },
  { muscle: 'abs', d: ab(150, 14) },
  { muscle: 'abs', d: ab(167, 14) },
  { muscle: 'abs', d: ab(184, 14) },
  { muscle: 'abs', d: 'M98 202 L118 202 L118 238 C109 235 101 227 98 216 Z' },
  { muscle: 'obliques', d: 'M75 150 C77 168 81 184 87 196 C85 206 83 216 81 227 C87 229 93 225 95 217 L95 157 C88 157 81 155 75 150 Z' },
  { d: 'M101 246 C106 254 112 260 118 263 L116 298 C110 286 104 266 101 246 Z' },
  { muscle: 'quads', d: 'M79 240 C72 270 72 310 80 348 C83 356 87 358 89 354 C83 318 81 280 86 246 C84 242 81 240 79 240 Z' },
  { muscle: 'quads', d: 'M89 246 C84 280 86 320 92 356 C96 360 100 358 102 352 C106 320 106 280 100 248 C96 244 92 244 89 246 Z' },
  { muscle: 'quads', d: 'M105 300 C109 316 110 336 108 352 C106 360 102 362 100 358 C104 340 105 320 105 300 Z' },
  { d: KNEE },
  { muscle: 'calves', d: 'M86 385 C83 403 84 424 88 446 C91 450 94 448 95 444 C96 424 95 403 92 385 Z' },
  { muscle: 'calves', d: 'M100 387 C104 400 107 416 106 432 C104 440 101 442 99 438 C99 420 99 403 100 387 Z' },
];

const BACK: Shape[] = [
  { muscle: 'traps', d: 'M118 62 C112 74 96 86 78 92 C92 96 106 102 118 120 Z' },
  { muscle: 'side_delts', d: DELT_OUTER, arm: true },
  { muscle: 'rear_delts', d: DELT_INNER, arm: true },
  { muscle: 'upper_back', d: 'M79 99 C91 101 105 106 116 124 L116 140 C102 136 88 128 78 117 Z' },
  { muscle: 'lats', d: 'M74 120 C84 132 100 140 116 144 L116 190 C104 186 92 176 84 164 C78 150 74 136 74 120 Z' },
  { muscle: 'triceps', d: ARM_UPPER, arm: true },
  { muscle: 'forearms', d: FOREARM, arm: true },
  { muscle: 'lower_back', d: 'M98 191 C104 193 110 195 117 195 L117 229 C108 227 100 218 97 205 Z' },
  { muscle: 'obliques', d: 'M84 169 C88 180 92 188 95 193 C94 204 90 216 84 226 C80 222 78 214 80 204 C82 192 84 181 84 169 Z' },
  { muscle: 'glutes', d: 'M78 233 C80 225 96 225 117 231 L117 268 C104 274 88 272 80 262 C76 252 76 242 78 233 Z' },
  { muscle: 'hamstrings', d: 'M78 273 C74 300 76 330 82 356 C86 360 92 358 94 352 C92 322 92 296 94 275 C88 277 82 277 78 273 Z' },
  { muscle: 'hamstrings', d: 'M97 277 C96 300 97 328 99 354 C103 358 107 354 108 348 C110 322 113 298 116 279 C110 281 103 281 97 277 Z' },
  { muscle: 'calves', d: 'M83 384 C80 400 81 420 86 436 C90 440 94 436 94 430 C95 414 94 398 92 384 Z' },
  { muscle: 'calves', d: 'M97 384 C96 400 97 420 100 434 C104 438 107 432 107 424 C108 408 106 394 104 384 Z' },
];

export const FRONT_MUSCLES: MuscleGroup[] = ['chest', 'front_delts', 'side_delts', 'biceps', 'forearms', 'abs', 'obliques', 'quads', 'calves', 'traps'];
export const BACK_MUSCLES: MuscleGroup[] = ['lats', 'upper_back', 'traps', 'rear_delts', 'side_delts', 'triceps', 'forearms', 'lower_back', 'obliques', 'glutes', 'hamstrings', 'calves'];

const label = (m: MuscleGroup) => m.replace('_', ' ');

/**
 * Female proportions are the same drawing pulled in or out around the centre line (x = 120),
 * by an amount that depends on height: narrower shoulders and waist, wider hips.
 */
const FEMALE_WIDTH: [number, number][] = [
  [0, 0.94], [60, 0.94], [84, 0.9], [100, 0.86], [135, 0.87], [165, 0.85], [192, 0.83],
  [216, 0.98], [246, 1.1], [278, 1.08], [330, 1.02], [372, 0.98], [410, 0.95], [510, 0.95],
];
const FEMALE_ARM_WIDTH = 0.87;

function femaleWidthAt(y: number): number {
  for (let i = 1; i < FEMALE_WIDTH.length; i++) {
    const [y0, s0] = FEMALE_WIDTH[i - 1];
    const [y1, s1] = FEMALE_WIDTH[i];
    if (y <= y1) return s0 + ((s1 - s0) * (y - y0)) / (y1 - y0);
  }
  return FEMALE_WIDTH[FEMALE_WIDTH.length - 1][1];
}

/** Every path here uses absolute M/L/C/Q commands, so its numbers are always x,y pairs. */
function reshape(d: string, arm: boolean): string {
  const parts = d.match(/[MLCQZ]|-?\d+(?:\.\d+)?/g) ?? [];
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (/[MLCQZ]/.test(parts[i])) {
      out.push(parts[i]);
      continue;
    }
    const x = parseFloat(parts[i]);
    const y = parseFloat(parts[++i]);
    const scale = arm ? FEMALE_ARM_WIDTH : femaleWidthAt(y);
    out.push((120 + (x - 120) * scale).toFixed(1), String(y));
  }
  return out.join(' ');
}

const forBuild = (shapes: Shape[], build: BodyBuild): Shape[] =>
  build === 'female' ? shapes.map((s) => ({ ...s, d: reshape(s.d, Boolean(s.arm)) })) : shapes;

const SHAPES: Record<BodyBuild, { centre: Shape[]; half: Shape[]; front: Shape[]; back: Shape[] }> = {
  male: { centre: SILHOUETTE_CENTRE, half: SILHOUETTE_HALF, front: FRONT, back: BACK },
  female: {
    centre: forBuild(SILHOUETTE_CENTRE, 'female'),
    half: forBuild(SILHOUETTE_HALF, 'female'),
    front: forBuild(FRONT, 'female'),
    back: forBuild(BACK, 'female'),
  },
};

/**
 * A human figure with every muscle as its own tappable shape. Muscles brighten with `intensity`;
 * the selected one is solid with an outline. Works with keyboard (Tab, Enter, Space).
 */
export function BodyFigure({ view, build = 'male', selected, intensity = {}, onSelect, interactive = true, className = '' }: BodyFigureProps) {
  const set = SHAPES[build];
  const shapes = view === 'front' ? set.front : set.back;
  const muscles = Array.from(new Set(shapes.map((s) => s.muscle).filter(Boolean))) as MuscleGroup[];

  return (
    <svg
      key={`${view}-${build}`}
      viewBox="0 0 240 510"
      role={interactive ? 'group' : 'img'}
      aria-label={`${view === 'front' ? 'Front' : 'Back'} of a ${build} body${interactive ? '. Choose a muscle.' : ''}`}
      className={`animate-flipIn ${className}`}
    >
      <g style={{ fill: 'var(--body-base)' }}>
        {build === 'female' && <circle cx="120" cy="10" r="8" />}
        {set.centre.map((s) => (
          <path key={s.d} d={s.d} />
        ))}
        {set.half.map((s) => (
          <React.Fragment key={s.d}>
            <path d={s.d} />
            <path d={s.d} transform={MIRROR} />
          </React.Fragment>
        ))}
      </g>

      <g style={{ fill: 'var(--muscle-idle)', stroke: 'var(--muscle-line)' }} strokeWidth="0.8">
        {shapes
          .filter((s) => !s.muscle)
          .map((s) => (
            <React.Fragment key={s.d}>
              <path d={s.d} />
              <path d={s.d} transform={MIRROR} />
            </React.Fragment>
          ))}
      </g>

      {muscles.map((muscle) => {
        const isSelected = selected === muscle;
        const t = Math.min(1, Math.max(0, intensity[muscle] ?? 0));
        const style: React.CSSProperties = isSelected
          ? { fill: 'rgb(var(--muscle-rgb))', stroke: 'var(--gym-text-primary)', strokeWidth: 1.4 }
          : t > 0
          ? { fill: `rgb(var(--muscle-rgb) / ${(0.16 + 0.5 * t).toFixed(2)})`, stroke: `rgb(var(--muscle-rgb) / ${(0.4 + 0.5 * t).toFixed(2)})`, strokeWidth: 0.8 }
          : { fill: 'var(--muscle-idle)', stroke: 'var(--muscle-line)', strokeWidth: 0.8 };

        const paths = shapes
          .filter((s) => s.muscle === muscle)
          .map((s) => (
            <React.Fragment key={s.d}>
              <path d={s.d} />
              <path d={s.d} transform={MIRROR} />
            </React.Fragment>
          ));

        if (!interactive) {
          return (
            <g key={muscle} style={{ ...style, transition: 'fill 0.35s ease, stroke 0.35s ease' }}>
              {paths}
            </g>
          );
        }

        return (
          <g
            key={muscle}
            role="button"
            tabIndex={0}
            aria-label={label(muscle)}
            aria-pressed={isSelected}
            onClick={() => onSelect?.(muscle)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect?.(muscle);
              }
            }}
            style={{ ...style, transition: 'fill 0.35s ease, stroke 0.35s ease' }}
            className="cursor-pointer outline-none hover:brightness-125 focus-visible:brightness-150"
          >
            {paths}
          </g>
        );
      })}
    </svg>
  );
}
