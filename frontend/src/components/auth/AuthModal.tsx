'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import { X, ArrowRight, Lock, Mail, User as UserIcon, Sparkles, AlertCircle } from 'lucide-react';

export function AuthModal() {
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, signup } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [prevModalOpen, setPrevModalOpen] = useState(isAuthModalOpen);
  const [prevAuthMode, setPrevAuthMode] = useState(authModalMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync mode with context mode when opened
  if (isAuthModalOpen !== prevModalOpen || authModalMode !== prevAuthMode) {
    setPrevModalOpen(isAuthModalOpen);
    setPrevAuthMode(authModalMode);
    if (isAuthModalOpen) {
      setMode(authModalMode);
      setError(null);
    }
  }

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      closeAuthModal();
      router.push('/courses');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md rounded-[2rem] p-1 bg-white/[0.04] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.95)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-[calc(2rem-0.25rem)] bg-[#0C0C14]/98 p-6 sm:p-8 backdrop-blur-2xl text-[#EDEDE8]">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <Logo href="/" size="sm" />
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Student Portal
              </span>
            </div>
            <button
              type="button"
              onClick={closeAuthModal}
              className="p-1.5 rounded-full text-[#9E9EA8] hover:text-[#EDEDE8] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight text-[#EDEDE8]">
              {mode === 'login' ? 'Sign in to KnowTrace' : 'Start Your Learning Journey'}
            </h2>
            <p className="text-xs text-[#9E9EA8] mt-1.5 leading-relaxed">
              {mode === 'login'
                ? 'Resume your personalized Bayesian learning path and active courses.'
                : 'Create an account to track your concept mastery and source-grounded tutoring.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-full p-1 bg-white/[0.03] border border-white/[0.08] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#9E9EA8] hover:text-[#EDEDE8]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#9E9EA8] hover:text-[#EDEDE8]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs mb-5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#EDEDE8] mb-1.5">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="absolute left-3.5 w-4 h-4 text-indigo-400/80" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#EDEDE8] placeholder:text-[#9E9EA8]/60 focus:outline-hidden focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#EDEDE8] mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-indigo-400/80" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#EDEDE8] placeholder:text-[#9E9EA8]/60 focus:outline-hidden focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#EDEDE8] mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-indigo-400/80" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#EDEDE8] placeholder:text-[#9E9EA8]/60 focus:outline-hidden focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="animate-spin text-xs">🌀</span>
                  <span>Authenticating...</span>
                </span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{mode === 'login' ? 'Sign In & Launch Workspace' : 'Create Account & Start Learning'}</span>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center ml-0.5">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer toggle */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center text-xs text-[#9E9EA8]">
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1 cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1 cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
