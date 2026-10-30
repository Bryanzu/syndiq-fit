'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  MessageSquare,
  Lightbulb,
  Bug,
  Sparkles,
  Check,
  RotateCcw,
  Trash2,
  Calendar,
  User,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { FeedbackItem, FeedbackCategory } from '@/lib/feedbackStorage';

export default function AdminFeedbackPage() {
  const [adminKey, setAdminKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | FeedbackCategory>('all');
  const [filterReviewed, setFilterReviewed] = useState<'all' | 'unreviewed' | 'reviewed'>('all');
  const [actionError, setActionError] = useState<string | null>(null);

  // Restore stored session admin key
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('syndiq_admin_key');
      if (stored) {
        setAdminKey(stored);
        fetchFeedback(stored);
      }
    }
  }, []);

  const fetchFeedback = async (key: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`/api/feedback?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify your administrator key.');
      }
      setFeedbackList(data.feedback || []);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('syndiq_admin_key', key);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Access denied.');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setAuthError('Please enter the administrator key.');
      return;
    }
    setAdminKey(keyInput.trim());
    fetchFeedback(keyInput.trim());
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminKey('');
    setKeyInput('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('syndiq_admin_key');
    }
  };

  const handleToggleReviewed = async (item: FeedbackItem) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/feedback?key=${encodeURIComponent(adminKey)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, reviewed: !item.reviewed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update feedback status.');

      setFeedbackList((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, reviewed: !item.reviewed } : f))
      );
    } catch (err: any) {
      setActionError(err.message || 'Action failed.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this feedback submission?')) {
      return;
    }

    setActionError(null);
    try {
      const res = await fetch(`/api/feedback?id=${encodeURIComponent(id)}&key=${encodeURIComponent(adminKey)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete feedback entry.');

      setFeedbackList((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      setActionError(err.message || 'Delete failed.');
    }
  };

  // Filtered entries
  const filteredList = feedbackList.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterReviewed === 'unreviewed' && item.reviewed) return false;
    if (filterReviewed === 'reviewed' && !item.reviewed) return false;
    return true;
  });

  const stats = {
    total: feedbackList.length,
    unreviewed: feedbackList.filter((f) => !f.reviewed).length,
    suggestions: feedbackList.filter((f) => f.category === 'suggestion').length,
    bugs: feedbackList.filter((f) => f.category === 'bug').length,
  };

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl transition-colors">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-gym-limeDark dark:text-gym-lime shadow-lime-sm">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Administrator Portal
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter your Syndiq Fit administrator key to review submissions and bug reports.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Administrator Key
              </label>
              <input
                type="password"
                placeholder="Enter secret admin key..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#121212] border border-zinc-200 dark:border-gym-border text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-gym-lime"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-sm shadow-lime-sm transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <span>Verifying...</span> : <span>Access Feedback Review</span>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-gym-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gym-lime text-black shadow-lime-sm flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Review</span>
              </span>
              <span className="text-xs text-zinc-400">Authorized Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              Tester Submissions & Feedback
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Review, mark, and organize community feedback and bug reports across all tester devices.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => fetchFeedback(adminKey)}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 font-bold text-xs transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Analytics Statistics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Total</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-white">{stats.total}</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Pending Review
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.unreviewed}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Suggestions</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-white">{stats.suggestions}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block">Bug Reports</span>
            <span className="text-2xl font-black text-red-500">{stats.bugs}</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 text-xs">
            {(['all', 'unreviewed', 'reviewed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterReviewed(st)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                  filterReviewed === st
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {(['all', 'suggestion', 'bug', 'experience', 'other'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap capitalize border transition-all ${
                  filterCategory === cat
                    ? 'bg-gym-lime text-black border-gym-lime shadow-lime-sm'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Feedback Items List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-12 text-center space-y-3">
            <MessageSquare className="w-10 h-10 mx-auto text-zinc-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">No Submissions Found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              No tester feedback matches the currently selected filter options.
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl sm:rounded-3xl border transition-all p-5 sm:p-6 space-y-4 ${
                item.reviewed
                  ? 'bg-white/60 dark:bg-gym-card/60 border-zinc-200 dark:border-zinc-800 opacity-85'
                  : 'bg-white dark:bg-gym-card border-zinc-200 dark:border-gym-border shadow-sm ring-1 ring-amber-500/20'
              }`}
            >
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
                    {item.username}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.category === 'bug'
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                        : item.category === 'suggestion'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : item.category === 'experience'
                        ? 'bg-gym-lime/15 text-gym-limeDark dark:text-gym-lime border border-gym-lime/30'
                        : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {item.reviewed ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Reviewed</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>Unreviewed</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Message Body */}
              <div className="bg-slate-50 dark:bg-[#121212] p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {item.message}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                <span className="font-mono text-[10px] text-zinc-400">ID: {item.id}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleReviewed(item)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      item.reviewed
                        ? 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                        : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{item.reviewed ? 'Mark Unreviewed' : 'Mark Reviewed'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
