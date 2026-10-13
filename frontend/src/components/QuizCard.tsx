'use client';

import React, { useState } from 'react';
import { QuizQuestion, QuestionFeedbackResult, Citation } from '@/types';
import { ConfidenceSlider } from './ConfidenceSlider';
import { CitationChip } from './CitationChip';
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizCardProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  onSubmit: (data: { selectedOptionId: string; confidence: number }) => Promise<QuestionFeedbackResult>;
  onNext: () => void;
  onCitationClick?: (citation: Citation) => void;
  isLastQuestion?: boolean;
}

export function QuizCard({
  question,
  currentIndex,
  totalQuestions,
  onSubmit,
  onNext,
  onCitationClick,
  isLastQuestion = false,
}: QuizCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [result, setResult] = useState<QuestionFeedbackResult | null>(null);

  const handleSubmit = async () => {
    if (!selectedOptionId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await onSubmit({
        selectedOptionId,
        confidence,
      });
      setResult(res);
      if (res.isCorrect) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const difficultyColors = {
    easy: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    medium: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    hard: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#141619] rounded-2xl border border-[#1D2024] shadow-md p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-[#1D2024]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#E06D3B]/15 text-[#E06D3B] border border-[#E06D3B]/30">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
              difficultyColors[question.difficulty]
            }`}
          >
            {question.difficulty}
          </span>
        </div>

        <div className="text-xs font-medium text-[#7E8078]">
          Target: <strong className="text-[#F6F5EE]">{question.conceptName}</strong>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-[#0C0D0E] border border-[#1D2024] text-xs text-[#F6F5EE]">
        <Sparkles className="w-4 h-4 text-[#E06D3B] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Adaptive Selection Reason: </span>
          <span className="text-[#C8C6B9]">{question.whySelectedReason}</span>
        </div>
      </div>

      <div className="text-base sm:text-lg font-bold text-[#F6F5EE] leading-snug">
        {question.question}
      </div>

      <div className="space-y-3">
        {question.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          const isSubmitted = !!result;
          const isCorrect = isSubmitted && opt.id === result.correctOptionId;
          const isWrongSelection = isSubmitted && isSelected && !result.isCorrect;

          return (
            <div
              key={opt.id}
              onClick={() => !isSubmitted && setSelectedOptionId(opt.id)}
              className={`p-4 rounded-xl border transition-all text-sm flex items-start gap-3.5 ${
                isSubmitted
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-200 font-semibold'
                    : isWrongSelection
                    ? 'border-rose-500 bg-rose-950/60 text-rose-200 font-semibold'
                    : 'border-[#1D2024] bg-[#0C0D0E] opacity-60 text-[#7E8078]'
                  : isSelected
                  ? 'border-[#E06D3B] bg-[#E06D3B]/10 text-[#F6F5EE] shadow-xs cursor-pointer'
                  : 'border-[#1D2024] bg-[#0C0D0E] hover:border-[#1D2024]/80 hover:bg-[#1A1D21] text-[#C8C6B9] cursor-pointer'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isSubmitted
                    ? isCorrect
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : isWrongSelection
                      ? 'border-rose-600 bg-rose-600 text-white'
                      : 'border-[#1D2024]'
                    : isSelected
                    ? 'border-[#E06D3B] bg-[#E06D3B] text-white'
                    : 'border-[#1D2024] bg-[#141619]'
                }`}
              >
                {isSubmitted ? (
                  isCorrect ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isWrongSelection ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : null
                ) : isSelected ? (
                  <div className="w-2 h-2 rounded-full bg-white" />
                ) : null}
              </div>

              <div className="flex-1 leading-relaxed">
                <span>{opt.text}</span>
              </div>
            </div>
          );
        })}
      </div>

      {!result && (
        <div className="space-y-4 pt-2">
          <ConfidenceSlider
            value={confidence}
            onChange={setConfidence}
            disabled={isSubmitting}
          />

          {question.hint && (
            <div>
              {showHint ? (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800 text-xs text-amber-200 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Pedagogical Hint: </span>
                    <span>{question.hint}</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7E8078] hover:text-[#E06D3B] transition-colors cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Need a hint?</span>
                </button>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={!selectedOptionId || isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] disabled:opacity-40 text-white font-bold text-sm font-mono shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
            >
              {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4 pt-4 border-t border-[#1D2024] animate-in fade-in duration-300">
          <div
            className={`p-4 rounded-xl flex items-center justify-between ${
              result.isCorrect
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
                : 'bg-rose-950/60 border border-rose-800 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5 font-bold text-sm">
              {result.isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Correct Answer! Well done.</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span>Incorrect Answer.</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 bg-[#0C0D0E] px-3 py-1.5 rounded-lg border border-[#1D2024] font-mono text-xs">
              <span className="font-semibold text-[#7E8078]">
                {result.conceptName}:
              </span>
              <span className="text-[#7E8078]">{result.masteryBefore}%</span>
              <span>→</span>
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  result.masteryDelta >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {result.masteryDelta >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {result.masteryAfter}% ({result.masteryDelta >= 0 ? `+${result.masteryDelta}` : result.masteryDelta}%)
              </span>
            </div>
          </div>

          {result.detectedMisconception && (
            <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800 text-xs text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300">
                  Detected Misconception: {result.detectedMisconception.title}
                </span>
                <p className="leading-relaxed text-[#C8C6B9]">{result.detectedMisconception.description}</p>
                <div className="text-[11px] font-semibold text-amber-400 pt-1">
                  Added to your personal Misconceptions tab for remediation.
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#0C0D0E] border border-[#1D2024] text-xs leading-relaxed space-y-2">
            <div className="font-bold text-[#F6F5EE]">Grounded Explanation:</div>
            <p className="text-[#C8C6B9]">{result.explanation}</p>

            {result.citation && (
              <div className="pt-2 flex items-center gap-2">
                <span className="text-[#7E8078] font-semibold text-[11px]">Cited Source:</span>
                <CitationChip citation={result.citation} onClick={onCitationClick} />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] text-white font-bold text-sm font-mono shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>{isLastQuestion ? 'View Complete Results' : 'Next Adaptive Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
