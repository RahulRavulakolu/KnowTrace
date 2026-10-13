'use client';

import React from 'react';
import { TutorMessage, Citation } from '@/types';
import { ModeBadge } from './ModeBadge';
import { CitationChip } from './CitationChip';
import { MarkdownRenderer } from './MarkdownRenderer';
import { User, Sparkles, HelpCircle } from 'lucide-react';

interface ChatMessageProps {
  message: TutorMessage;
  onCitationClick?: (citation: Citation) => void;
  onAllowGeneralKnowledge?: () => void;
}

export function ChatMessage({
  message,
  onCitationClick,
  onAllowGeneralKnowledge,
}: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-[#E06D3B]/15 border border-[#E06D3B]/30 text-[#E06D3B] flex items-center justify-center shrink-0 shadow-xs mt-1">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-2xl flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            {message.mode && <ModeBadge mode={message.mode} confidence={message.confidence} />}
            <span className="text-[10px] text-[#7E8078] font-mono">{message.timestamp}</span>
          </div>
        )}

        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-[#E06D3B] text-white font-medium rounded-br-xs shadow-xs'
              : 'bg-[#141619] border border-[#1D2024] text-[#F6F5EE] rounded-bl-xs shadow-xs'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-line text-sm leading-relaxed">{message.text}</div>
          ) : (
            <MarkdownRenderer
              content={message.text}
              citations={message.citations}
              onCitationClick={onCitationClick}
            />
          )}

          {message.mode === 'not-covered' && message.outsideKnowledgeAvailable && onAllowGeneralKnowledge && (
            <div className="mt-4 pt-3 border-t border-[#1D2024] flex items-center justify-between">
              <span className="text-xs text-[#7E8078] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#7E8078]" />
                Want general LLM reasoning?
              </span>
              <button
                type="button"
                onClick={onAllowGeneralKnowledge}
                className="px-3 py-1 rounded-lg bg-[#E06D3B]/15 text-[#E06D3B] hover:bg-[#E06D3B]/25 border border-[#E06D3B]/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                Show General Answer
              </button>
            </div>
          )}
        </div>

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-semibold text-[#7E8078] flex items-center gap-1">
              📚 Sources:
            </span>
            {message.citations.map((citation) => (
              <CitationChip
                key={citation.id}
                citation={citation}
                onClick={onCitationClick}
              />
            ))}
          </div>
        )}

        {isUser && (
          <span className="text-[10px] text-[#7E8078] font-mono mt-1 mr-1">{message.timestamp}</span>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-[#1A1D21] border border-[#1D2024] text-[#E06D3B] flex items-center justify-center shrink-0 shadow-xs mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
