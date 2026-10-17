import React from 'react';
import { MuscleGroup } from '@/types/workout';

interface SvgBodyProps {
  primaryMuscles?: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  selectedMuscle?: MuscleGroup | null;
  onMuscleClick?: (muscle: MuscleGroup) => void;
  className?: string;
}

export function SvgBodyFemaleBack({
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
      {/* Head / Neck back */}
      <circle cx="100" cy="35" r="18" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
      <path d="M95 52 L95 65 L105 65 L105 52 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

      {/* Traps (Female Upper / Mid Back) */}
      <path
        d="M93 64 L100 60 L107 64 L122 75 L107 106 L100 112 L93 106 L78 75 Z"
        fill={getFill('traps')}
        style={{ filter: getFilter('traps'), cursor: onMuscleClick ? 'pointer' : 'default' }}
        stroke="#27272a"
        strokeWidth="1"
        onClick={() => handleClick('traps')}
      >
        <title>Trapezius</title>
      </path>

      {/* Rear Delts (Female) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }}>
        <path
          d="M76 74 L66 82 L64 97 L74 99 L78 84 Z"
          fill={getFill('rear_delts')}
          style={{ filter: getFilter('rear_delts') }}
          stroke="#27272a"
          strokeWidth="1"
          onClick={() => handleClick('rear_delts')}
        >
          <title>Rear Deltoids</title>
        </path>
        <path
          d="M124 74 L134 82 L136 97 L126 99 L122 84 Z"
          fill={getFill('rear_delts')}
          style={{ filter: getFilter('rear_delts') }}
          stroke="#27272a"
          strokeWidth="1"
          onClick={() => handleClick('rear_delts')}
        >
          <title>Rear Deltoids</title>
        </path>
      </g>

      {/* Triceps (Female) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('triceps')}>
        <title>Triceps</title>
        <path
          d="M64 99 L60 125 L70 128 L74 103 Z"
          fill={getFill('triceps')}
          style={{ filter: getFilter('triceps') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M136 99 L140 125 L130 128 L126 103 Z"
          fill={getFill('triceps')}
          style={{ filter: getFilter('triceps') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Forearms Back (Female) */}
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

      {/* Lats (Female V-Taper to narrow waist) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('lats')}>
        <title>Lats (Latissimus Dorsi)</title>
        <path
          d="M77 86 L90 106 L89 150 L73 135 C70 118 72 102 77 86 Z"
          fill={getFill('lats')}
          style={{ filter: getFilter('lats') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M123 86 L110 106 L111 150 L127 135 C130 118 128 102 123 86 Z"
          fill={getFill('lats')}
          style={{ filter: getFilter('lats') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Lower Back (Female) */}
      <path
        d="M93 118 L107 118 L105 166 L95 166 Z"
        fill={getFill('lower_back')}
        style={{ filter: getFilter('lower_back'), cursor: onMuscleClick ? 'pointer' : 'default' }}
        stroke="#27272a"
        strokeWidth="1"
        onClick={() => handleClick('lower_back')}
      >
        <title>Lower Back (Erectors)</title>
      </path>

      {/* Glutes (Female - Fuller, wider anatomical curve) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('glutes')}>
        <title>Glutes (Gluteus Maximus)</title>
        {/* Left Glute */}
        <path
          d="M72 168 C78 168 98 168 98 168 L98 214 L73 211 C64 195 64 180 72 168 Z"
          fill={getFill('glutes')}
          style={{ filter: getFilter('glutes') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        {/* Right Glute */}
        <path
          d="M128 168 C122 168 102 168 102 168 L102 214 L127 211 C136 195 136 180 128 168 Z"
          fill={getFill('glutes')}
          style={{ filter: getFilter('glutes') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Hamstrings (Female posterior chain) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('hamstrings')}>
        <title>Hamstrings</title>
        <path
          d="M73 216 L96 216 L94 270 L72 266 C68 245 68 230 73 216 Z"
          fill={getFill('hamstrings')}
          style={{ filter: getFilter('hamstrings') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M104 216 L127 216 C132 230 132 245 128 266 L106 270 Z"
          fill={getFill('hamstrings')}
          style={{ filter: getFilter('hamstrings') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Knee Back neutral */}
      <circle cx="83" cy="278" r="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
      <circle cx="117" cy="278" r="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

      {/* Calves Back (Female posterior calves) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('calves')}>
        <title>Calves (Posterior)</title>
        <path
          d="M75 286 L93 286 L89 356 L79 356 C74 338 73 310 75 286 Z"
          fill={getFill('calves')}
          style={{ filter: getFilter('calves') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M107 286 L125 286 C127 310 126 338 121 356 L111 356 Z"
          fill={getFill('calves')}
          style={{ filter: getFilter('calves') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Feet neutral */}
      <path d="M75 360 L89 360 L89 374 L73 374 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
      <path d="M111 360 L125 360 L127 374 L111 374 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
    </svg>
  );
}
