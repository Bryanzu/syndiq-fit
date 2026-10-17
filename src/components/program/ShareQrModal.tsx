'use client';

import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-gym-card border border-gym-border rounded-3xl overflow-hidden shadow-2xl animate-scaleUp p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gym-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center text-gym-lime">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Send Plan to Phone</h3>
              <p className="text-xs text-zinc-400">Access your workout on the gym floor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-4">
          <div className="p-6 rounded-2xl bg-[#141414] border border-gym-border flex flex-col items-center justify-center">
            {/* Direct QR visual representation via public QR service or link */}
            <div className="p-3 bg-white rounded-xl shadow-md mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  shareUrl
                )}`}
                alt="Syndiq fit Program QR Code"
                className="w-40 h-40 object-contain"
              />
            </div>
            <p className="text-xs text-zinc-400 max-w-xs">
              Scan with your phone camera to instantly load your customized plan on mobile without signing in.
            </p>
          </div>

          {/* Copyable Link */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 block text-left">
              Or copy direct plan link:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-[#141414] border border-gym-border rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-gym-lime select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-lime-sm min-h-[44px]"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gym-border text-center">
          <p className="text-xs text-zinc-400">
            Your workout is saved to your browser and accessible across all devices via this link.
          </p>
        </div>
      </div>
    </div>
  );
}
