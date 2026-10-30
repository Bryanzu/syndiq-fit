'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MessageSquare,
  Lightbulb,
  Bug,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { FeedbackCategory } from '@/lib/feedbackStorage';

export default function FeedbackPage() {
  const [username, setUsername] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUser = username.trim();
    const trimmedMsg = message.trim();

    if (!trimmedUser) {
      setErrorMsg('Please enter a username or nickname.');
      return;
    }
    if (trimmedUser.length > 50) {
      setErrorMsg('Username must be 50 characters or less.');
      return;
    }
    if (!trimmedMsg) {
      setErrorMsg('Please enter your feedback message.');
      return;
    }
    if (trimmedMsg.length < 5) {
      setErrorMsg('Feedback message must be at least 5 characters.');
      return;
    }
    if (trimmedMsg.length > 1200) {
      setErrorMsg('Feedback message exceeds 1200 characters limit.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUser,
          category,
          message: trimmedMsg,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback.');
      }

      setIsSuccess(true);
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { id: FeedbackCategory; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'suggestion',
      label: 'Suggestion',
      icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
      desc: 'Ideas to improve the workout or meal plan',
    },
    {
      id: 'bug',
      label: 'Bug Report',
      icon: <Bug className="w-4 h-4 text-red-500" />,
      desc: 'Something broken, visual error, or issue',
    },
    {
      id: 'experience',
      label: 'Experience',
      icon: <Sparkles className="w-4 h-4 text-gym-limeDark dark:text-gym-lime" />,
      desc: 'How the app felt to use during your test',
    },
    {
      id: 'other',
      label: 'General / Other',
      icon: <MessageSquare className="w-4 h-4 text-indigo-400" />,
      desc: 'Questions or general remarks',
    },
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner Card with Fitness Photography */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-gym-border bg-white dark:bg-gym-card shadow-lg transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="md:col-span-7 p-6 sm:p-10 space-y-3 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gym-lime text-black shadow-lime-sm">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Tester Community</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Share Your Feedback
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
              Testing Syndiq Fit? Let us know what worked, what felt confusing, or any issues you encountered. No registration or password required.
            </p>
          </div>

          <div className="md:col-span-5 relative h-48 md:h-full min-h-[200px] w-full overflow-hidden bg-zinc-900">
            <Image
              src="/images/fitness-hero.jpg"
              alt="Syndiq Fit community athlete training"
              fill
              className="object-cover opacity-85 object-center hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white dark:from-gym-card via-transparent to-transparent md:w-24 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Feedback Form Card */}
      <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-10 shadow-sm transition-colors">
        {isSuccess ? (
          <div className="text-center py-10 space-y-6 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gym-lime/20 border border-gym-lime flex items-center justify-center text-gym-limeDark dark:text-gym-lime shadow-lime-sm">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                Feedback Received!
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                Thank you for helping us polish Syndiq Fit. Your comments are stored centrally for our team to review.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="px-6 py-3 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-sm shadow-lime-sm transition-all hover:scale-105"
              >
                Submit Another Comment
              </button>
              <Link
                href="/program"
                className="px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-sm transition-colors"
              >
                Back to Workout Plan
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-700 dark:text-red-400 text-xs sm:text-sm animate-fadeIn">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Username / Nickname field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="fb-username"
                  className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
                  <span>Your Name or Tester Nickname *</span>
                </label>
                <span className="text-[11px] text-zinc-400">No account required</span>
              </div>
              <input
                id="fb-username"
                type="text"
                placeholder="e.g., Kelechi, Amaka, or GymTester_01"
                maxLength={50}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#121212] border border-zinc-200 dark:border-gym-border text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-gym-lime ring-1 ring-transparent focus:ring-gym-lime transition-all"
              />
            </div>

            {/* Feedback Category */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block">
                Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all min-h-[52px] ${
                      category === cat.id
                        ? 'bg-gym-lime/15 border-gym-lime text-zinc-900 dark:text-white shadow-lime-sm ring-1 ring-gym-lime font-bold'
                        : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 mt-0.5">
                      {cat.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block">{cat.label}</span>
                      <span className="text-[10px] text-zinc-500 block leading-tight">{cat.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Message Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="fb-message"
                  className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
                  <span>Feedback Message *</span>
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    message.length > 1100 ? 'text-amber-500 font-bold' : 'text-zinc-400'
                  }`}
                >
                  {message.length} / 1200
                </span>
              </div>
              <textarea
                id="fb-message"
                rows={5}
                maxLength={1200}
                placeholder="What did you like? What was confusing? If reporting a bug, what screen did it happen on?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#121212] border border-zinc-200 dark:border-gym-border text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-gym-lime ring-1 ring-transparent focus:ring-gym-lime transition-all resize-y"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
                <span>Your submission is securely delivered directly to our app administrator.</span>
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-2xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-sm shadow-lime-md transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Admin Link Footer */}
      <div className="text-center pt-4">
        <Link
          href="/admin/feedback"
          className="text-xs text-zinc-400 hover:text-gym-limeDark dark:hover:text-gym-lime transition-colors inline-flex items-center gap-1"
        >
          <span>Administrator Review Portal</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
