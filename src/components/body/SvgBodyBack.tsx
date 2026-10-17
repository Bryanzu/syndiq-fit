import React from 'react';
import { MuscleGroup } from '@/types/workout';

interface SvgBodyProps {
  primaryMuscles?: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  selectedMuscle?: MuscleGroup | null;
  onMuscleClick?: (muscle: MuscleGroup) => void;
  className?: string;
}

export function SvgBodyBack({
  primaryMuscles = [],
  secondaryMuscles = [],
  selectedMuscle,
  onMuscleClick,
  className = '',
}: SvgBodyProps) {
  const getFill = (muscle: MuscleGroup) => {
    if (selectedMuscle === muscle) return '#a3e635'; // Bright lime
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
      <circle cx="100" cy="35" r="20" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
      <path d="M94 54 L94 65 L106 65 L106 54 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

      {/* Traps (Upper / Middle diamond) */}
      <path
        d="M92 64 L100 60 L108 64 L126 76 L108 108 L100 114 L92 108 L74 76 Z"
        fill={getFill('traps')}
        style={{ filter: getFilter('traps'), cursor: onMuscleClick ? 'pointer' : 'default' }}
        stroke="#27272a"
        strokeWidth="1"
        onClick={() => handleClick('traps')}
      >
        <title>Trapezius</title>
      </path>

      {/* Rear Delts */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }}>
        <path
          d="M72 74 L60 84 L58 100 L70 102 L76 86 Z"
          fill={getFill('rear_delts')}
          style={{ filter: getFilter('rear_delts') }}
          stroke="#27272a"
          strokeWidth="1"
          onClick={() => handleClick('rear_delts')}
        >
          <title>Rear Deltoids</title>
        </path>
        <path
          d="M128 74 L140 84 L142 100 L130 102 L124 86 Z"
          fill={getFill('rear_delts')}
          style={{ filter: getFilter('rear_delts') }}
          stroke="#27272a"
          strokeWidth="1"
          onClick={() => handleClick('rear_delts')}
        >
          <title>Rear Deltoids</title>
        </path>
      </g>

      {/* Triceps */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('triceps')}>
        <title>Triceps</title>
        <path
          d="M58 102 L54 128 L66 132 L70 106 Z"
          fill={getFill('triceps')}
          style={{ filter: getFilter('triceps') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M142 102 L146 128 L134 132 L130 106 Z"
          fill={getFill('triceps')}
          style={{ filter: getFilter('triceps') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Forearms back */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('forearms')}>
        <title>Forearms</title>
        <path
          d="M54 134 L46 168 L56 174 L66 138 Z"
          fill={getFill('forearms')}
          style={{ filter: getFilter('forearms') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M146 134 L154 168 L144 174 L134 138 Z"
          fill={getFill('forearms')}
          style={{ filter: getFilter('forearms') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Lats (Wings) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('lats')}>
        <title>Lats (Latissimus Dorsi)</title>
        <path
          d="M74 88 L90 108 L88 152 L70 136 Z"
          fill={getFill('lats')}
          style={{ filter: getFilter('lats') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M126 88 L110 108 L112 152 L130 136 Z"
          fill={getFill('lats')}
          style={{ filter: getFilter('lats') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Lower Back (Erector Spinae) */}
      <path
        d="M92 120 L108 120 L106 168 L94 168 Z"
        fill={getFill('lower_back')}
        style={{ filter: getFilter('lower_back'), cursor: onMuscleClick ? 'pointer' : 'default' }}
        stroke="#27272a"
        strokeWidth="1"
        onClick={() => handleClick('lower_back')}
      >
        <title>Lower Back (Erectors)</title>
      </path>

      {/* Glutes */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('glutes')}>
        <title>Glutes</title>
        {/* Left Glute */}
        <path
          d="M74 170 L98 170 L98 212 L72 208 Z"
          fill={getFill('glutes')}
          style={{ filter: getFilter('glutes') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        {/* Right Glute */}
        <path
          d="M102 170 L126 170 L128 208 L102 212 Z"
          fill={getFill('glutes')}
          style={{ filter: getFilter('glutes') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Hamstrings */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('hamstrings')}>
        <title>Hamstrings</title>
        <path
          d="M74 214 L96 214 L94 270 L72 265 Z"
          fill={getFill('hamstrings')}
          style={{ filter: getFilter('hamstrings') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M104 214 L126 214 L128 265 L106 270 Z"
          fill={getFill('hamstrings')}
          style={{ filter: getFilter('hamstrings') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Knee Back neutral */}
      <circle cx="84" cy="278" r="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
      <circle cx="116" cy="278" r="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

      {/* Calves Back (Gastrocnemius & Soleus) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('calves')}>
        <title>Calves (Posterior)</title>
        <path
          d="M74 286 L94 286 L90 358 L78 358 Z"
          fill={getFill('calves')}
          style={{ filter: getFilter('calves') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M106 286 L126 286 L122 358 L110 358 Z"
          fill={getFill('calves')}
          style={{ filter: getFilter('calves') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Feet neutral */}
      <path d="M76 362 L90 362 L90 376 L74 376 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
      <path d="M110 362 L124 362 L126 376 L110 376 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
    </svg>
  );
}
