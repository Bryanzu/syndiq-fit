/**
 * Re-mounts on every navigation, so each route plays the page-enter animation.
 * The animation is plain CSS with no fill-mode: once it ends the wrapper has no transform,
 * which keeps `position: fixed` sheets inside pages anchored to the viewport.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
