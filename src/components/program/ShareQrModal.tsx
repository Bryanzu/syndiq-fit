'use client';

import React, { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { X, Copy, Check, Smartphone, Share2 } from 'lucide-react';

interface ShareQrModalProps {
  shareUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareQrModal({ shareUrl, isOpen, onClose }: ShareQrModalProps) {
  const [copied, setCopied] = useState(false);

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
    <Sheet isOpen={isOpen} onClose={onClose} labelledBy="share-qr-title" zClass="z-[100]" maxWidth="max-w-md">
        {/* Header - Fixed/Sticky */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gym-border bg-gym-cardAlt shrink-0 sticky top-0 z-10 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gym-lime/15 border border-gym-lime/40 flex items-center justify-center text-gym-limeDark dark:text-gym-lime">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="share-qr-title"
                className="text-base font-bold text-gym-text"
              >
                Send to your phone
              </h3>
              <p className="text-xs text-gym-textMuted">
                Open this plan on another device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-2xl text-gym-textMuted hover:text-gym-text hover:brightness-110 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain touch-pan-y space-y-5 flex-1 min-h-0 modal-content-scroll text-center">
          <div className="p-5 sm:p-6 rounded-3xl bg-gym-cardAlt flex flex-col items-center justify-center">
            {/* Direct QR visual representation */}
            <div className="p-3 bg-white rounded-2xl shadow-md mb-3 ">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  shareUrl
                )}`}
                alt="Syndiq fit Program QR Code"
                className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
              />
            </div>
            <p className="text-xs text-gym-textMuted max-w-xs">
              Scan with your phone camera. No sign-in needed.
            </p>
          </div>

          {/* Copyable Link */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-semibold text-gym-textMuted block">
              Or copy the link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-gym-cardAlt border border-gym-borderHover rounded-2xl px-3 py-2.5 text-xs text-gym-text focus:outline-none focus:border-gym-lime select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-2xl bg-gym-lime hover:bg-gym-limeLight text-gym-ink font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-all min-h-[44px]"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3.5 sm:p-4 border-t border-gym-border bg-gym-cardAlt text-center shrink-0 sticky bottom-0 z-10 transition-colors">
          <p className="text-xs text-gym-textMuted">
            The link rebuilds this plan on any device.
          </p>
        </div>
    </Sheet>
  );
}
