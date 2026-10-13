'use client';

import React, { useState } from 'react';
import { Misconception } from '@/types';
import {
  AlertTriangle,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MisconceptionCardProps {
  misconception: Misconception;
  onRemediate: (id: string) => Promise<void>;
  onPracticeConcept: (conceptId: string) => void;
}

export function MisconceptionCard({
  misconception,
  onRemediate,
  onPracticeConcept,
}: MisconceptionCardProps) {
  const [isOpenRemediation, setIsOpenRemediation] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedQuickCheck, setSelectedQuickCheck] = useState<number | null>(null);
  const [isCheckSubmitted, setIsCheckSubmitted] = useState<boolean>(false);

  const steps = [
    { title: 'The Confusion', key: 'contrast' },
    { title: 'Deep Explanation', key: 'explanation' },
    { title: 'Real-World Case', key: 'example' },
    { title: 'Intuitive Analogy', key: 'analogy' },
    { title: 'Quick Check Drill', key: 'check' },
  ];

  const handleQuickCheckSubmit = async () => {
    if (selectedQuickCheck === null) return;
    setIsCheckSubmitted(true);
    const isCorrect =
      selectedQuickCheck === misconception.remediation.quickCheckQuestion.correctIndex;
    if (isCorrect) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      await onRemediate(misconception.id);
    }
  };

  const renderSeverityDots = (level: number) => {
    return (
      <div className="flex items-center gap-1" title={`Severity ${level}/5`}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full ${
              idx < level ? 'bg-[#C94A44]' : 'bg-[#1D2024]'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-[#1D2024] bg-[#141619] p-6 shadow-xs hover:border-[#E06D3B]/40 transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E06D3B] font-mono">
            {misconception.conceptName}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#7E8078] font-mono font-semibold">Severity:</span>
            {renderSeverityDots(misconception.severity)}
          </div>
        </div>

        <h3 className="text-base font-bold text-[#F6F5EE] mb-2">
          {misconception.title}
        </h3>

        <p className="text-xs text-[#C8C6B9] leading-relaxed mb-4">
          {misconception.description}
        </p>

        {/* Evidence Box */}
        <div className="p-3.5 rounded-xl bg-[#C94A44]/10 border border-[#C94A44]/30 text-xs mb-6 space-y-1.5">
          <div className="font-bold text-[#C94A44] flex items-center gap-1.5 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-[#C94A44]" />
            <span>Behavioral Evidence ({misconception.evidenceCount} occurrences):</span>
          </div>
          <ul className="list-disc list-inside text-[#C8C6B9] space-y-1 text-[11px]">
            {misconception.evidenceDetails.map((ev, i) => (
              <li key={i}>{ev}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-[#1D2024] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {misconception.status === 'remediated' ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3E8E68] bg-[#3E8E68]/15 px-2.5 py-1 rounded-full border border-[#3E8E68]/30 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> Remediated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#C94A44] bg-[#C94A44]/15 px-2.5 py-1 rounded-full border border-[#C94A44]/30 font-mono">
              <AlertTriangle className="w-3.5 h-3.5" /> Active Confusion
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPracticeConcept(misconception.conceptId)}
            className="px-3 py-1.5 rounded-xl border border-[#1D2024] bg-[#0C0D0E] hover:bg-[#1A1D21] text-xs font-semibold text-[#C8C6B9] hover:text-[#F6F5EE] transition-colors cursor-pointer font-mono"
          >
            Practice
          </button>
          <button
            type="button"
            onClick={() => setIsOpenRemediation(true)}
            className="px-4 py-1.5 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer font-mono"
          >
            Review Difference
          </button>
        </div>
      </div>

      {/* Interactive 5-Step Remediation Modal */}
      {isOpenRemediation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#141619] rounded-2xl shadow-2xl border border-[#1D2024] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#1D2024] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E06D3B] font-mono">
                  Adaptive Remediation Flow
                </span>
                <h3 className="text-base font-bold text-[#F6F5EE]">
                  {misconception.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpenRemediation(false);
                  setActiveStep(0);
                  setIsCheckSubmitted(false);
                }}
                className="p-1.5 rounded-lg text-[#7E8078] hover:text-[#F6F5EE] hover:bg-[#1A1D21] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex border-b border-[#1D2024] bg-[#0C0D0E] px-4 overflow-x-auto">
              {steps.map((s, idx) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer font-mono ${
                    activeStep === idx
                      ? 'border-[#E06D3B] text-[#E06D3B] bg-[#141619]'
                      : 'border-transparent text-[#7E8078] hover:text-[#F6F5EE]'
                  }`}
                >
                  {idx + 1}. {s.title}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed space-y-4 text-[#F6F5EE]">
              {activeStep === 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#F6F5EE] flex items-center gap-2 font-mono">
                    <Sparkles className="w-4 h-4 text-[#E06D3B]" />
                    Contrast & Clarification
                  </h4>
                  <p className="text-[#C8C6B9] bg-[#0C0D0E] p-4 rounded-xl border border-[#1D2024]">
                    {misconception.remediation.contrastSummary}
                  </p>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#F6F5EE] flex items-center gap-2 font-mono">
                    <BookOpen className="w-4 h-4 text-[#E06D3B]" />
                    Detailed Mathematical & Conceptual Explanation
                  </h4>
                  <div className="text-[#C8C6B9] whitespace-pre-line text-xs sm:text-sm bg-[#0C0D0E] p-4 rounded-xl border border-[#1D2024]">
                    {misconception.remediation.detailedExplanation}
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#F6F5EE] flex items-center gap-2 font-mono">
                    <Lightbulb className="w-4 h-4 text-[#D48838]" />
                    Real-World Practical Case
                  </h4>
                  <div className="p-4 rounded-xl bg-[#D48838]/10 border border-[#D48838]/30 text-[#C8C6B9] text-xs sm:text-sm">
                    {misconception.remediation.realWorldExample}
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#F6F5EE] flex items-center gap-2 font-mono">
                    <Sparkles className="w-4 h-4 text-[#E06D3B]" />
                    Memorable Intuitive Analogy
                  </h4>
                  <div className="p-4 rounded-xl bg-[#E06D3B]/10 border border-[#E06D3B]/30 text-[#C8C6B9] text-xs sm:text-sm">
                    {misconception.remediation.analogy}
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-[#F6F5EE] flex items-center gap-2 font-mono">
                    <HelpCircle className="w-4 h-4 text-[#E06D3B]" />
                    Quick Check Diagnostic Drill
                  </h4>

                  <div className="text-sm font-semibold text-[#F6F5EE]">
                    {misconception.remediation.quickCheckQuestion.question}
                  </div>

                  <div className="space-y-2">
                    {misconception.remediation.quickCheckQuestion.options.map((opt, i) => {
                      const isSelected = selectedQuickCheck === i;
                      const isCorrect =
                        i === misconception.remediation.quickCheckQuestion.correctIndex;

                      return (
                        <div
                          key={i}
                          onClick={() => !isCheckSubmitted && setSelectedQuickCheck(i)}
                          className={`p-3 rounded-xl border text-xs flex items-center gap-3 transition-all ${
                            isCheckSubmitted
                              ? isCorrect
                                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200 font-bold'
                                : isSelected
                                ? 'bg-rose-950/60 border-rose-700 text-rose-200 font-bold'
                                : 'opacity-50 border-[#1D2024]'
                              : isSelected
                              ? 'bg-[#E06D3B]/10 border-[#E06D3B] text-[#F6F5EE] font-medium cursor-pointer'
                              : 'border-[#1D2024] bg-[#0C0D0E] hover:border-[#1D2024]/80 text-[#C8C6B9] cursor-pointer'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-[#E06D3B] bg-[#E06D3B] text-white font-mono font-bold' : 'border-[#1D2024] bg-[#141619]'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {isCheckSubmitted && (
                    <div className="p-4 rounded-xl bg-[#0C0D0E] border border-[#1D2024] text-xs space-y-2">
                      <div className="font-bold flex items-center gap-1.5">
                        {selectedQuickCheck ===
                        misconception.remediation.quickCheckQuestion.correctIndex ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Correct! Misconception remediated (+12% Mastery update).
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Not quite right. Review the explanation in Step 2.
                          </span>
                        )}
                      </div>
                      <p className="text-[#C8C6B9]">
                        {misconception.remediation.quickCheckQuestion.explanation}
                      </p>
                    </div>
                  )}

                  {!isCheckSubmitted && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        disabled={selectedQuickCheck === null}
                        onClick={handleQuickCheckSubmit}
                        className="px-5 py-2 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] disabled:opacity-40 text-white font-mono font-bold text-xs shadow-xs transition-all cursor-pointer"
                      >
                        Submit Check
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#1D2024] bg-[#0C0D0E] flex items-center justify-between text-xs">
              <button
                type="button"
                disabled={activeStep === 0}
                onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#1D2024] bg-[#141619] disabled:opacity-30 hover:bg-[#1A1D21] text-[#C8C6B9] hover:text-[#F6F5EE] font-semibold cursor-pointer"
              >
                Previous Step
              </button>

              <span className="text-[#7E8078] font-mono">
                Step {activeStep + 1} of {steps.length}
              </span>

              {activeStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((s) => Math.min(steps.length - 1, s + 1))}
                  className="px-4 py-1.5 rounded-lg bg-[#E06D3B] hover:bg-[#FF9457] text-white font-mono font-semibold cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOpenRemediation(false)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
