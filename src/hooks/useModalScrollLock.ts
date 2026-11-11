'use client';

import { useEffect, useCallback } from 'react';

let activeModalsCount = 0;
let savedOriginalOverflow = '';
let savedOriginalTouchAction = '';

export function useModalScrollLock(isOpen: boolean, onClose?: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    if (activeModalsCount === 0) {
      savedOriginalOverflow = document.body.style.overflow;
      savedOriginalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.classList.add('modal-open');
    }
    activeModalsCount++;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      activeModalsCount = Math.max(0, activeModalsCount - 1);
      if (activeModalsCount === 0) {
        document.body.style.overflow = savedOriginalOverflow;
        document.body.style.touchAction = savedOriginalTouchAction;
        document.body.classList.remove('modal-open');
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Safe backdrop click handler: closes ONLY if click was directly on the backdrop element
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && onClose) {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose]
  );

  return { handleBackdropClick };
}
