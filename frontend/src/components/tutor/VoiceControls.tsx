'use client';

import React from 'react';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';

interface VoiceControlsProps {
  isConnected: boolean;
  isMuted: boolean;
  isAudioOutputMuted: boolean;
  agentState: 'connecting' | 'listening' | 'thinking' | 'speaking' | 'idle';
  onToggleMic: () => void;
  onToggleAudioOutput: () => void;
  onDisconnect: () => void;
  onConnect: () => void;
  error?: string | null;
}

export function VoiceControls({
  isConnected,
  isMuted,
  isAudioOutputMuted,
  agentState,
  onToggleMic,
  onToggleAudioOutput,
  onDisconnect,
  onConnect,
  error,
}: VoiceControlsProps) {
  return (
    <div className="w-full flex flex-col items-center gap-3">
      {error && (
        <div className="w-full p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3 p-2 bg-[#141619] border border-[#1D2024] rounded-2xl shadow-xl">
        {isConnected ? (
          <>
            {/* Microphone Mute/Unmute */}
            <button
              type="button"
              onClick={onToggleMic}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              className={`p-3.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                  : 'bg-[#E06D3B] text-black font-bold hover:bg-[#FF9457] shadow-[0_0_20px_rgba(224,109,59,0.3)]'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="text-xs font-bold pr-1">{isMuted ? 'Unmute' : 'Speaking'}</span>
            </button>

            {/* Speaker Mute/Unmute */}
            <button
              type="button"
              onClick={onToggleAudioOutput}
              title={isAudioOutputMuted ? 'Unmute Speaker' : 'Mute Speaker'}
              className="p-3 rounded-xl bg-[#0C0D0E] hover:bg-[#1D2024] text-[#C8C6B9] hover:text-[#F6F5EE] border border-[#1D2024] transition-colors cursor-pointer"
            >
              {isAudioOutputMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* End Call / Disconnect */}
            <button
              type="button"
              onClick={onDisconnect}
              title="Disconnect Voice Session"
              className="px-4 py-3 rounded-xl bg-rose-900/40 hover:bg-rose-800/60 text-rose-200 border border-rose-800/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            className="px-6 py-3 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(224,109,59,0.35)] transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Connect LiveKit Voice & Avatar</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-[#7E8078] font-mono text-center">
        {isConnected
          ? 'Voice Activity Detection (Silero VAD) enabled • Speak freely or interrupt anytime'
          : 'Click connect to initiate WebRTC session with the AI Tutor'}
      </p>
    </div>
  );
}
