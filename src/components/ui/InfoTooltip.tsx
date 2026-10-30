'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  title?: string;
  content: string;
  className?: string;
  iconSize?: number;
}

export function InfoTooltip({ title, content, className = '', iconSize = 14 }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <span className={`relative inline-flex items-center align-middle mx-1 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={title ? `Information about ${title}` : 'Help information'}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="p-0.5 rounded-full text-zinc-400 hover:text-gym-limeDark dark:hover:text-gym-lime focus:outline-none focus:ring-1 focus:ring-gym-lime transition-colors"
      >
        <Info style={{ width: iconSize, height: iconSize }} className="shrink-0" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="tooltip"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 sm:w-72 p-3 bg-zinc-900 text-white dark:bg-[#1c1c1c] dark:text-zinc-100 rounded-xl shadow-xl border border-zinc-700 dark:border-zinc-700 text-xs leading-relaxed animate-fadeIn"
          style={{ maxWidth: 'calc(100vw - 32px)' }}
        >
          {title && (
            <div className="font-extrabold text-gym-lime mb-1 text-[11px] uppercase tracking-wider">
              {title}
            </div>
          )}
          <p className="text-zinc-200 dark:text-zinc-300 font-normal">{content}</p>
          {/* Subtle pointer arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-zinc-900 dark:bg-[#1c1c1c] border-r border-b border-zinc-700 dark:border-zinc-700 rotate-45 pointer-events-none" />
        </div>
      )}
    </span>
  );
}
