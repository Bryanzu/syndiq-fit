'use client';

import React, { useState } from 'react';
import { useModalScrollLock } from '@/hooks/useModalScrollLock';
import { X, Copy, Check, Smartphone, Share2 } from 'lucide-react';

interface ShareQrModalProps {
  shareUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareQrModal({ shareUrl, isOpen, onClose }: ShareQrModalProps) {
  const [copied, setCopied] = useState(false);
  const { handleBackdropClick } = useModalScrollLock(isOpen, onClose);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/80 dark:bg-black/85 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-qr-title"
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-scaleUp max-h-[calc(100dvh-1.5rem)] sm:max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed/Sticky */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-gym-border bg-slate-50 dark:bg-[#141414] shrink-0 sticky top-0 z-10 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gym-lime/15 border border-gym-lime/40 flex items-center justify-center text-gym-limeDark dark:text-gym-lime">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="share-qr-title"
                className="text-base font-bold text-zinc-900 dark:text-white"
              >
                Send Plan to Phone
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Access your workout on the gym floor
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

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain touch-pan-y space-y-5 flex-1 min-h-0 modal-content-scroll text-center">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#141414] border border-zinc-200 dark:border-gym-border flex flex-col items-center justify-center">
            {/* Direct QR visual representation */}
            <div className="p-3 bg-white rounded-xl shadow-md mb-3 border border-zinc-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  shareUrl
                )}`}
                alt="Syndiq fit Program QR Code"
                className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
              />
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs">
              Scan with your phone camera to instantly load your customized plan on mobile without signing in.
            </p>
          </div>

          {/* Copyable Link */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
              Or copy direct plan link:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-slate-50 dark:bg-[#141414] border border-zinc-300 dark:border-gym-border rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-gym-lime select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-lime-sm min-h-[44px]"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-200 dark:border-gym-border bg-slate-50 dark:bg-[#141414] text-center shrink-0 sticky bottom-0 z-10 transition-colors">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Your workout is saved to your browser and accessible across all devices via this link.
          </p>
        </div>
      </div>
    </div>
  );
}
