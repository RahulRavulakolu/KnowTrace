'use client';

import React from 'react';
import { Citation, TutorMessage } from '@/types';
import { FileText, Sparkles, User, Bot, ExternalLink, HelpCircle, Trash2 } from 'lucide-react';

interface VoiceTranscriptFeedProps {
  messages: TutorMessage[];
  onCitationClick?: (citation: Citation) => void;
  activeCitation?: Citation | null;
  agentState: 'connecting' | 'listening' | 'thinking' | 'speaking' | 'idle';
  onClear?: () => void;
}

export function VoiceTranscriptFeed({
  messages,
  onCitationClick,
  activeCitation,
  agentState,
  onClear,
}: VoiceTranscriptFeedProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest turn
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, agentState]);

  return (
    <div className="flex flex-col h-full bg-[#141619] rounded-3xl border border-[#1D2024] overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1D2024] bg-[#0C0D0E]/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#E06D3B]" />
          <h4 className="text-xs font-bold text-[#F6F5EE]">Live Socratic Transcript</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#7E8078] uppercase">
            {messages.length} Turns Logged
          </span>
          {onClear && messages.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-lg text-[#7E8078] hover:text-[#E06D3B] hover:bg-[#1D2024] transition-colors cursor-pointer"
              title="Clear Transcript History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Message Feed */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#7E8078] space-y-2">
            <Sparkles className="w-8 h-8 text-[#E06D3B]/40 animate-pulse" />
            <p className="font-semibold text-xs text-[#C8C6B9]">Voice Channel Ready</p>
            <p className="text-[11px] max-w-xs">
              Say something like: &ldquo;Explain the difference between L1 and L2 regularization&rdquo; to start the conversation.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={`${msg.id || 'msg'}-${idx}`}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#E06D3B]/10 border border-[#E06D3B]/20 flex items-center justify-center text-[#E06D3B] shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2.5 ${
                    isUser
                      ? 'bg-[#E06D3B] text-black font-medium'
                      : 'bg-[#0C0D0E] text-[#F6F5EE] border border-[#1D2024]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <span className={isUser ? 'font-bold opacity-80' : 'text-[#7E8078] font-mono'}>
                      {isUser ? 'You' : 'Dr. Julian'}
                    </span>
                    <span className={isUser ? 'opacity-70' : 'text-[#7E8078]'}>
                      {msg.timestamp || 'Just now'}
                    </span>
                  </div>

                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Grounded Citations rendered under tutor turn */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-[#1D2024] space-y-1.5">
                      <div className="text-[10px] font-mono font-bold text-[#E06D3B] uppercase tracking-wider flex items-center gap-1">
                        <span>Grounded Sources ({msg.citations.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => onCitationClick?.(c)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141619] hover:bg-[#1A1D21] border border-[#1D2024] hover:border-[#E06D3B]/40 text-[#C8C6B9] hover:text-[#F6F5EE] text-[11px] transition-all cursor-pointer group text-left"
                          >
                            <span className="font-semibold truncate max-w-[150px]">
                              {c.sourceTitle}
                            </span>
                            {c.pageNumber && (
                              <span className="text-[#7E8078] font-mono">p.{c.pageNumber}</span>
                            )}
                            <ExternalLink className="w-2.5 h-2.5 text-[#7E8078] group-hover:text-[#E06D3B]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#141619] border border-[#1D2024] flex items-center justify-center text-[#C8C6B9] shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Live typing / thinking indicator */}
        {agentState === 'thinking' && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0C0D0E] border border-[#1D2024] w-fit text-[#7E8078]">
            <span className="w-2 h-2 rounded-full bg-[#E06D3B] animate-ping" />
            <span className="text-[11px] font-mono">Formulating grounded response...</span>
          </div>
        )}
      </div>
    </div>
  );
}
