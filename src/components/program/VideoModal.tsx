'use client';

import React from 'react';
import { Exercise } from '@/types/workout';
import { useModalScrollLock } from '@/hooks/useModalScrollLock';
import { X, ExternalLink, Play } from 'lucide-react';

interface VideoModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ exercise, isOpen, onClose }: VideoModalProps) {
  const { handleBackdropClick } = useModalScrollLock(isOpen, onClose);

  if (!isOpen || !exercise) return null;

  const hasDirectEmbed = Boolean(exercise.youtubeId && exercise.youtubeId.trim().length > 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/80 dark:bg-black/85 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-scaleUp max-h-[calc(100dvh-1.5rem)] sm:max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed/Sticky */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-200 dark:border-gym-border bg-slate-50 dark:bg-[#141414] shrink-0 sticky top-0 z-10 transition-colors">
          <div className="flex items-center gap-3 pr-2">
            <div className="w-8 h-8 rounded-lg bg-gym-lime/15 border border-gym-lime/40 flex items-center justify-center text-gym-limeDark dark:text-gym-lime shrink-0">
              <Play className="w-4 h-4 fill-gym-limeDark dark:fill-gym-lime" />
            </div>
            <div>
              <h3
                id="video-modal-title"
                className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white"
              >
                {exercise.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Exercise Form & Execution Demonstration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player or Fallback - Scrollable container */}
        <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 bg-black flex items-center justify-center modal-content-scroll">
          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            {hasDirectEmbed ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${exercise.youtubeId}?autoplay=1&rel=0`}
                title={`${exercise.name} demonstration`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-6 sm:p-8 max-w-md">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gym-lime/15 border border-gym-lime/40 flex items-center justify-center text-gym-lime">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1 fill-gym-lime" />
                </div>
                <h4 className="text-white font-semibold text-base sm:text-lg mb-2">
                  Video Demonstration
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 mb-6 leading-relaxed">
                  Watch verified form cues and biomechanical execution guide for{' '}
                  <strong className="text-white">{exercise.name}</strong> on YouTube.
                </p>
                <a
                  href={exercise.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-xs sm:text-sm shadow-lime-md transition-all hover:scale-105 min-h-[44px]"
                >
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer with key cues - Fixed/Sticky */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-[#141414] border-t border-zinc-200 dark:border-gym-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 sticky bottom-0 z-10 transition-colors">
          <div className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl">
            <span className="font-semibold text-gym-limeDark dark:text-gym-lime">Coach Tip:</span>{' '}
            {exercise.instructions[0] || 'Perform with controlled tempo and full range of motion.'}
          </div>
          <a
            href={exercise.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-gym-limeDark dark:text-zinc-400 dark:hover:text-gym-lime transition-colors shrink-0 font-medium"
          >
            <span>Open in YouTube app</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
