import React from 'react';
import { MuscleGroup } from '@/types/workout';

interface SvgBodyProps {
  primaryMuscles?: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  selectedMuscle?: MuscleGroup | null;
  onMuscleClick?: (muscle: MuscleGroup) => void;
  className?: string;
}

export function SvgBodyFront({
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
      {/* Head / Neck Outline */}
      <circle cx="100" cy="35" r="20" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
      <path d="M94 54 L94 65 L106 65 L106 54 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

      {/* Traps (Front view) */}
      <path
        d="M84 66 L94 62 L106 62 L116 66 L124 72 L112 76 L88 76 L76 72 Z"
        fill={getFill('traps')}
        style={{ filter: getFilter('traps'), cursor: onMuscleClick ? 'pointer' : 'default' }}
        stroke="#27272a"
        strokeWidth="1"
        onClick={() => handleClick('traps')}
      >
        <title>Traps</title>
      </path>

      {/* Front & Side Delts (Shoulders) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }}>
        {/* Left Shoulder */}
        <path
          d="M74 72 L62 82 L60 98 L72 102 L76 86 Z"
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
          d="M126 72 L138 82 L140 98 L128 102 L124 86 Z"
          fill={getFill('front_delts')}
          style={{ filter: getFilter('front_delts') }}
          stroke="#27272a"
          strokeWidth="1"
          onClick={() => handleClick('front_delts')}
        >
          <title>Front Deltoids</title>
        </path>
      </g>

      {/* Chest (Left & Right Pectoralis) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('chest')}>
        <title>Chest</title>
        {/* Left Pec */}
        <path
          d="M76 82 L98 82 L98 114 L76 110 L72 96 Z"
          fill={getFill('chest')}
          style={{ filter: getFilter('chest') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        {/* Right Pec */}
        <path
          d="M102 82 L124 82 L128 96 L124 110 L102 114 Z"
          fill={getFill('chest')}
          style={{ filter: getFilter('chest') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Biceps */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('biceps')}>
        <title>Biceps</title>
        <path
          d="M60 102 L56 126 L66 132 L72 108 Z"
          fill={getFill('biceps')}
          style={{ filter: getFilter('biceps') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M140 102 L144 126 L134 132 L128 108 Z"
          fill={getFill('biceps')}
          style={{ filter: getFilter('biceps') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Forearms */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('forearms')}>
        <title>Forearms</title>
        <path
          d="M56 134 L48 168 L58 174 L68 138 Z"
          fill={getFill('forearms')}
          style={{ filter: getFilter('forearms') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M144 134 L152 168 L142 174 L132 138 Z"
          fill={getFill('forearms')}
          style={{ filter: getFilter('forearms') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Abs / Core */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('abs')}>
        <title>Abs / Core</title>
        <path
          d="M84 116 L116 116 L114 172 L86 172 Z"
          fill={getFill('abs')}
          style={{ filter: getFilter('abs') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        {/* Six pack lines */}
        <line x1="100" y1="116" x2="100" y2="170" stroke="#121212" strokeWidth="1.5" />
        <line x1="86" y1="134" x2="114" y2="134" stroke="#121212" strokeWidth="1.2" />
        <line x1="86" y1="152" x2="114" y2="152" stroke="#121212" strokeWidth="1.2" />
      </g>

      {/* Obliques */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('obliques')}>
        <title>Obliques</title>
        <path
          d="M74 116 L82 116 L84 168 L72 160 Z"
          fill={getFill('obliques')}
          style={{ filter: getFilter('obliques') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M126 116 L118 116 L116 168 L128 160 Z"
          fill={getFill('obliques')}
          style={{ filter: getFilter('obliques') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Hips / Pelvis neutral */}
      <path d="M74 168 L126 168 L120 188 L80 188 Z" fill="#18181b" stroke="#27272a" strokeWidth="1" />

      {/* Quads (Left & Right Thighs) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('quads')}>
        <title>Quadriceps</title>
        {/* Left Quad */}
        <path
          d="M78 190 L98 190 L96 270 L72 265 L68 215 Z"
          fill={getFill('quads')}
          style={{ filter: getFilter('quads') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        {/* Right Quad */}
        <path
          d="M102 190 L122 190 L132 215 L128 265 L104 270 Z"
          fill={getFill('quads')}
          style={{ filter: getFilter('quads') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Knees neutral */}
      <circle cx="84" cy="280" r="7" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
      <circle cx="116" cy="280" r="7" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

      {/* Calves (Front Shin / Anterior) */}
      <g style={{ cursor: onMuscleClick ? 'pointer' : 'default' }} onClick={() => handleClick('calves')}>
        <title>Calves</title>
        <path
          d="M76 290 L92 290 L88 360 L78 360 Z"
          fill={getFill('calves')}
          style={{ filter: getFilter('calves') }}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M108 290 L124 290 L122 360 L112 360 Z"
          fill={getFill('calves')}
          style={{ filter: getFilter('calves') }}
          stroke="#27272a"
          strokeWidth="1"
        />
      </g>

      {/* Feet neutral */}
      <path d="M74 364 L90 364 L94 380 L68 380 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
      <path d="M110 364 L126 364 L132 380 L106 380 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
    </svg>
  );
}
