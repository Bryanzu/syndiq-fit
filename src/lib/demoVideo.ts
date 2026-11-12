import type { Exercise } from '@/types/workout';
import { exerciseVideos, type ExerciseVideo } from '@/data/exerciseVideos';

/**
 * The verified demo video for an exercise, or null when there isn't one.
 * Looked up by exercise id first, so programs saved before the videos were added still get them.
 */
export function demoVideo(exercise: Pick<Exercise, 'id' | 'youtubeId'>): ExerciseVideo | null {
  const known = exerciseVideos[exercise.id];
  if (known) return known;
  const id = exercise.youtubeId?.trim();
  return id ? { id, title: '', channel: '' } : null;
}

export const youtubeWatchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

export const youtubeSearchUrl = (exerciseName: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + ' proper form')}`;

/** The privacy-enhanced embed. Plays straight away and inline on phones. */
export const youtubeEmbedUrl = (videoId: string) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;

export const youtubeThumbnailUrl = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

/** Where an "open on YouTube" link should go: the video itself, or a search when there is none. */
export function demoLink(exercise: Pick<Exercise, 'id' | 'youtubeId' | 'youtubeUrl' | 'name'>): string {
  const video = demoVideo(exercise);
  if (video) return youtubeWatchUrl(video.id);
  return exercise.youtubeUrl || youtubeSearchUrl(exercise.name);
}
