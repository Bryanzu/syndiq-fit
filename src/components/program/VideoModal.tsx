'use client';

import React, { useEffect } from 'react';
import { Exercise } from '@/types/workout';
import { X, ExternalLink, Play } from 'lucide-react';

interface VideoModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ exercise, isOpen, onClose }: VideoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !exercise) return null;

  const hasDirectEmbed = Boolean(exercise.youtubeId && exercise.youtubeId.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-gym-card border border-gym-border rounded-2xl overflow-hidden shadow-2xl animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gym-border bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center text-gym-lime">
              <Play className="w-4 h-4 fill-gym-lime" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{exercise.name}</h3>
              <p className="text-xs text-zinc-400">Exercise Form & Execution Demonstration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player or Fallback */}
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
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gym-lime/10 border border-gym-lime/40 flex items-center justify-center text-gym-lime">
                <Play className="w-8 h-8 ml-1 fill-gym-lime" />
              </div>
              <h4 className="text-white font-semibold text-lg mb-2">Video Demonstration</h4>
              <p className="text-sm text-zinc-400 mb-6">
                Watch verified form cues and biomechanical execution guide for <strong className="text-zinc-200">{exercise.name}</strong> on YouTube.
              </p>
              <a
                href={exercise.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-bold text-sm shadow-lime-md transition-all hover:scale-105"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Footer with key cues */}
        <div className="p-5 bg-[#141414] border-t border-gym-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-zinc-400 max-w-xl">
            <span className="font-semibold text-gym-lime">Coach Tip:</span> {exercise.instructions[0] || 'Perform with controlled tempo and full range of motion.'}
          </div>
          <a
            href={exercise.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-gym-lime transition-colors shrink-0"
          >
            <span>Open in YouTube app</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
