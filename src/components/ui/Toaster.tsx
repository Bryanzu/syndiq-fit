'use client';

import React, { useEffect, useState } from 'react';

interface ToastItem {
  id: number;
  message: string;
}

type Listener = (item: ToastItem) => void;

const listeners = new Set<Listener>();
let nextId = 1;

/** Show a short, non-blocking message. Safe to call from any client component or handler. */
export function toast(message: string): void {
  const item = { id: nextId++, message };
  listeners.forEach((l) => l(item));
}

const VISIBLE_MS = 3200;

/** Mount once (in the root layout). Renders the messages sent with `toast()`. */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast: Listener = (item) => {
      setItems((prev) => [...prev.slice(-2), item]);
      window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== item.id)), VISIBLE_MS);
    };
    listeners.add(onToast);
    return () => {
      listeners.delete(onToast);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-[200] flex flex-col items-center gap-2 px-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-8 print:hidden"
    >
      {items.map((t) => (
        <p
          key={t.id}
          className="animate-riseIn max-w-sm rounded-2xl bg-gym-text px-4 py-3 text-center text-sm font-medium text-gym-bg shadow-float"
        >
          {t.message}
        </p>
      ))}
    </div>
  );
}
