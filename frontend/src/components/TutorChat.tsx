'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TutorMessage, Citation } from '@/types';
import { ChatMessage } from './ChatMessage';
import { Send, Sparkles, Globe, RefreshCw } from 'lucide-react';
import { Logo } from './Logo';

interface TutorChatProps {
  messages: TutorMessage[];
  onSendMessage: (text: string, allowOutsideKnowledge: boolean) => Promise<any>;
  onCitationClick?: (citation: Citation) => void;
  isLoading?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'Why does precision change with recall?',
  'Why does L1 regularization cause sparsity while L2 does not?',
  'How does Momentum prevent gradient descent oscillations?',
  'What is the capital of France? (Test outside-knowledge guardrail)',
];

export function TutorChat({
  messages,
  onSendMessage,
  onCitationClick,
  isLoading = false,
}: TutorChatProps) {
  const [inputText, setInputText] = useState('');
  const [allowOutsideKnowledge, setAllowOutsideKnowledge] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text, allowOutsideKnowledge);
  };

  const handleSuggestedClick = async (question: string) => {
    if (isLoading) return;
    await onSendMessage(question, allowOutsideKnowledge);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[550px] bg-[#0C0D0E] rounded-2xl border border-[#1D2024] overflow-hidden shadow-xs">
      <div className="px-6 py-3.5 bg-[#141619] border-b border-[#1D2024] flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <Logo variant="icon" size="sm" />
          <span className="font-bold text-[#F6F5EE]">
            KnowTrace Grounded AI Tutor
          </span>
          <span className="text-[#7E8078] text-[11px] hidden sm:inline">
            • Strict Source Attribution Enabled
          </span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allowOutsideKnowledge}
            onChange={(e) => setAllowOutsideKnowledge(e.target.checked)}
            className="rounded text-[#E06D3B] focus:ring-0 cursor-pointer accent-[#E06D3B]"
          />
          <span className="text-[#C8C6B9] font-medium flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-[#7E8078]" />
            Allow General Knowledge Fallback
          </span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg, idx) => (
          <ChatMessage
            key={`${msg.id || 'msg'}-${idx}`}
            message={msg}
            onCitationClick={onCitationClick}
            onAllowGeneralKnowledge={() => {
              setAllowOutsideKnowledge(true);
              onSendMessage('Show general answer from outside knowledge', true);
            }}
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#141619] border border-[#1D2024] w-fit">
            <div className="w-6 h-6 rounded-lg bg-[#E06D3B]/10 flex items-center justify-center text-[#E06D3B] animate-spin">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs text-[#7E8078] font-medium">
              Searching course index & formulating source-grounded response...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-2 bg-[#141619] border-t border-[#1D2024] flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[#7E8078] font-semibold shrink-0 text-[11px] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#E06D3B]" /> Ask:
        </span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSuggestedClick(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-[#0C0D0E] hover:bg-[#1A1D21] text-[#C8C6B9] hover:text-[#E06D3B] border border-[#1D2024] transition-colors shrink-0 text-[11px] cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-3 sm:p-4 bg-[#141619] border-t border-[#1D2024] flex items-center gap-3"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about your course materials..."
          disabled={isLoading}
          className="flex-1 bg-[#0C0D0E] border border-[#1D2024] rounded-xl px-4 py-2.5 text-sm text-[#F6F5EE] placeholder-[#7E8078] focus:outline-hidden focus:ring-2 focus:ring-[#E06D3B] focus:border-[#E06D3B] transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] disabled:opacity-40 text-black font-bold font-mono text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
