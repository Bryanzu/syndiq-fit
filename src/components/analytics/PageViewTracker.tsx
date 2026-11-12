'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics/client';

/** Counts a visit on every page the user opens. Sends the path only, never the query string. */
export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) track('visit', pathname);
  }, [pathname]);
  return null;
}
