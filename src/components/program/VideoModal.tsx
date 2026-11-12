'use client';

import React, { useEffect, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Exercise } from '@/types/workout';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { demoLink, demoVideo, youtubeEmbedUrl, youtubeThumbnailUrl } from '@/lib/demoVideo';

interface VideoModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatLength = (seconds?: number) =>
  seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : '';

/**
 * The exercise demo. Plays the exercise's YouTube video inside the sheet (privacy-enhanced embed);
 * an exercise without one gets a YouTube search link instead.
 * The player is only mounted while the sheet is open, so nothing loads from YouTube until then.
 */
export function VideoModal({ exercise, isOpen, onClose }: VideoModalProps) {
  const video = exercise ? demoVideo(exercise) : null;
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    setPlayerReady(false);
  }, [video?.id, isOpen]);

  if (!isOpen || !exercise) return null;

  const link = demoLink(exercise);
  const cues = exercise.instructions.slice(0, 3);
  const credit = video
    ? [video.channel && `Video by ${video.channel}`, formatLength(video.seconds)].filter(Boolean).join(' · ')
    : 'Opens a YouTube search';

  return (
    <Sheet isOpen={isOpen} onClose={onClose} labelledBy="video-modal-title" zClass="z-[150]" maxWidth="max-w-3xl">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-gym-cardAlt modal-content-scroll">
        {/* Player */}
        <div className="px-3 pt-1 sm:px-5 sm:pt-5">
          <div className="relative aspect-video w-full overflow-hidden rounded-[20px] bg-black" data-demo-player={video ? 'embed' : 'search'}>
            {video ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail, shown until the player paints */}
                <img
                  src={youtubeThumbnailUrl(video.id)}
                  alt=""
                  aria-hidden
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${playerReady ? 'opacity-0' : 'opacity-100'}`}
                />
                <iframe
                  key={video.id}
                  src={youtubeEmbedUrl(video.id)}
                  title={`${exercise.name} demo`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  onLoad={() => setPlayerReady(true)}
                />
                {!playerReady && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
                    <span className="flex size-14 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 animate-spin text-gym-lime" />
                    </span>
                  </span>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gym-cardInner p-6 text-center">
                <p className="t-small">No demo for this one yet</p>
                <a href={link} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Find it on YouTube
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Title and credit */}
        <div className="flex items-start gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
          <div className="min-w-0 flex-1">
            <h3 id="video-modal-title" className="text-[22px] font-bold leading-tight tracking-tight text-gym-text sm:text-[26px]">
              {exercise.name}
            </h3>
            <p className="t-small mt-1 truncate">{credit}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="btn-icon tap shrink-0 bg-gym-cardInner">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form cues */}
        {cues.length > 0 && (
          <ol className="space-y-2.5 px-4 pt-4 sm:px-6">
            {cues.map((cue, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-gym-text">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gym-lime/15 text-[11px] font-semibold text-gym-limeDark dark:text-gym-lime">
                  {i + 1}
                </span>
                <span>{cue}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="px-4 pb-5 pt-5 sm:px-6 sm:pb-6">
          {video && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full">
              <ExternalLink className="h-4 w-4" />
              Open on YouTube
            </a>
          )}
        </div>
      </div>
    </Sheet>
  );
}
