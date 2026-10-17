import React from 'react';
import { MuscleGroup } from '@/types/workout';

interface SvgBodyProps {
  primaryMuscles?: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  selectedMuscle?: MuscleGroup | null;
  onMuscleClick?: (muscle: MuscleGroup) => void;
  className?: string;
}

export function SvgBodyFemaleFront({
  primaryMuscles = [],
  secondaryMuscles = [],
  selectedMuscle,
  onMuscleClick,
  className = '',
}: SvgBodyProps) {
  const getFill = (muscle: MuscleGroup) => {
    if (selectedMuscle === muscle) return '#a3e635'; // Bright lime selected
    if (primaryMuscles.includes(muscle)) return '#84cc16'; // Primary lime
    if (secondaryMuscles.includes(muscle)) return '#4d7c0f'; // Secondary olive/lime
    return '#1f2937'; // Neutral dark slate
  };

  const getFilter = (muscle: MuscleGroup) => {
    if (selectedMuscle === muscle || primaryMuscles.includes(muscle)) {
      return 'drop-shadow(0 0 6px rgba(132, 204, 22, 0.7))';
    }
    return undefined;
  };

  const handleClick = (muscle: MuscleGroup) => {
    if (onMuscleClick) onMuscleClick(muscle);
  };

  return (
    <svg
      viewBox="0 0 200 420"
      className={`w-full max-w-[220px] select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head / Neck Outline (Graceful female silhouette) */}
      <circle cx="100" cy="35" r="18" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
      <path d="M95 52 L95 65 L105 65 L105 52 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

      {/* Traps (Female Front View - narrower, graceful slope) */}
      <path
        d="M87 66 L95 62 L105 62 L113 66 L120 72 L110 75 L90 75 L80 72 Z"
        fill={getFill('traps')}
        style={{ filter: getFilter('traps'), cursor: onMuscleClick ? 'pointer' : 'default' }}
        stroke="#27272a"
        strokeWidth="1"
        onClick={() => handleClick('traps')}
      >
        <title>Traps</title>
      </path>

      {/* Shoulders / Front Delts (Female proportioned) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }}>
        {/* Left Shoulder */}
        <path
          d="M78 72 L67 80 L65 95 L75 99 L79 84 Z"
          fill={getFill('front_delts')}
          style={{ filter: getFilter('front_delts') }}
          stroke="#27272a"
          strokeWidth="1"
          onClick={() => handleClick('front_delts')}
        >
          <title>Front Deltoids</title>
        </path>
        {/* Right Shoulder */}
        <path
          d="M122 72 L133 80 L135 95 L125 99 L121 84 Z"
          fill={getFill('front_delts')}
          style={{ filter: getFilter('front_delts') }}
          stroke="#27272a"
          strokeWidth="1"
          onClick={() => handleClick('front_delts')}
        >
          <title>Front Deltoids</title>
        </path>
      </g>

      {/* Chest / Pectoralis (Female anatomical bust contour) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('chest')}>
        <title>Chest / Pectorals</title>
        {/* Left Breast / Pec area */}
        <path
          d="M79 80 C88 80 97 82 98 86 L98 108 C97 122 84 125 74 116 C66 108 67 92 75 83 Z"
          fill={getFill('chest')}
          style={{ filter: getFilter('chest') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        {/* Right Breast / Pec area */}
        <path
          d="M121 80 C112 80 103 82 102 86 L102 108 C103 122 116 125 126 116 C134 108 133 92 125 83 Z"
          fill={getFill('chest')}
          style={{ filter: getFilter('chest') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Biceps (Female arm contour) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('biceps')}>
        <title>Biceps</title>
        <path
          d="M65 98 L60 124 L69 128 L74 104 Z"
          fill={getFill('biceps')}
          style={{ filter: getFilter('biceps') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M135 98 L140 124 L131 128 L126 104 Z"
          fill={getFill('biceps')}
          style={{ filter: getFilter('biceps') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Forearms (Female) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('forearms')}>
        <title>Forearms</title>
        <path
          d="M60 130 L52 165 L60 170 L68 134 Z"
          fill={getFill('forearms')}
          style={{ filter: getFilter('forearms') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M140 130 L148 165 L140 170 L132 134 Z"
          fill={getFill('forearms')}
          style={{ filter: getFilter('forearms') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Abs / Core (Female defined tapered midsection) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('abs')}>
        <title>Abs / Core</title>
        <path
          d="M87 116 L113 116 L110 170 L90 170 Z"
          fill={getFill('abs')}
          style={{ filter: getFilter('abs') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        {/* Subtle abdominal line */}
        <line x1="100" y1="116" x2="100" y2="168" stroke="#121212" strokeWidth="1.2" />
        <line x1="90" y1="138" x2="110" y2="138" stroke="#121212" strokeWidth="1" />
      </g>

      {/* Obliques (Narrow female waist curving inward) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('obliques')}>
        <title>Obliques</title>
        <path
          d="M77 118 L86 118 L89 168 L73 162 C71 146 72 132 77 118 Z"
          fill={getFill('obliques')}
          style={{ filter: getFilter('obliques') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M123 118 L114 118 L111 168 L127 162 C129 146 128 132 123 118 Z"
          fill={getFill('obliques')}
          style={{ filter: getFilter('obliques') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Female Pelvis / Hips (Wider anatomical curve) */}
      <path d="M72 168 C80 168 120 168 128 168 C135 180 134 195 124 196 L76 196 C66 195 65 180 72 168 Z" fill="#18181b" stroke="#27272a" strokeWidth="1" />

      {/* Quads (Female curved thighs from wider hips down to knees) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('quads')}>
        <title>Quadriceps</title>
        {/* Left Quad */}
        <path
          d="M74 198 L98 198 L95 270 L70 266 C65 240 66 215 74 198 Z"
          fill={getFill('quads')}
          style={{ filter: getFilter('quads') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        {/* Right Quad */}
        <path
          d="M102 198 L126 198 C134 215 135 240 130 266 L105 270 Z"
          fill={getFill('quads')}
          style={{ filter: getFilter('quads') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Knees neutral */}
      <circle cx="83" cy="280" r="6.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
      <circle cx="117" cy="280" r="6.5" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

      {/* Calves (Female Anterior) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('calves')}>
        <title>Calves</title>
        <path
          d="M76 290 L91 290 L88 358 L78 358 C74 340 73 315 76 290 Z"
          fill={getFill('calves')}
          style={{ filter: getFilter('calves') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M109 290 L124 290 C127 315 126 340 122 358 L112 358 Z"
          fill={getFill('calves')}
          style={{ filter: getFilter('calves') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Feet neutral */}
      <path d="M74 362 L89 362 L93 378 L69 378 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
      <path d="M111 362 L126 362 L131 378 L107 378 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
    </svg>
  );
}
