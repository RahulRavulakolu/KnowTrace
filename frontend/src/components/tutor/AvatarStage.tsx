'use client';

import React from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

interface AvatarStageProps {
  agentState: 'connecting' | 'listening' | 'thinking' | 'speaking' | 'idle';
  isMuted: boolean;
  avatarVideoTrack?: MediaStreamTrack | null;
  agentName?: string;
  courseTitle?: string;
}

export function AvatarStage({
  agentState,
  isMuted,
  avatarVideoTrack,
  agentName = 'Dr. Julian (KnowTrace AI)',
  courseTitle = 'Machine Learning (CS229)',
}: AvatarStageProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (videoRef.current && avatarVideoTrack) {
      const stream = new MediaStream([avatarVideoTrack]);
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [avatarVideoTrack]);

  return (
    <div className="relative w-full h-full min-h-0 bg-gradient-to-b from-[#141619] via-[#0C0D0E] to-[#0A0B0C] rounded-3xl border border-[#1D2024] p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
      {/* Dynamic Background Glow based on agent state */}
      <div
        className={`absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          agentState === 'speaking'
            ? 'bg-[#E06D3B]/20 scale-125'
            : agentState === 'listening'
            ? 'bg-emerald-500/15 scale-110'
            : agentState === 'thinking'
            ? 'bg-amber-500/15 scale-110'
            : 'bg-[#E06D3B]/5 scale-100'
        }`}
      />

      <div
        className={`absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          agentState === 'speaking'
            ? 'bg-[#FF9457]/15'
            : 'bg-zinc-800/20'
        }`}
      />

      {/* Top Header Information inside Stage */}
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0C0D0E] border border-[#1D2024] flex items-center justify-center text-[#E06D3B] shadow-inner">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F6F5EE] tracking-tight">{agentName}</h3>
            <p className="text-[10px] font-mono text-[#7E8078]">{courseTitle}</p>
          </div>
        </div>

        {/* Live State Indicator Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border transition-all ${
              agentState === 'speaking'
                ? 'bg-[#E06D3B]/15 text-[#E06D3B] border-[#E06D3B]/30'
                : agentState === 'listening'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : agentState === 'thinking'
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse'
                : 'bg-[#141619] text-[#7E8078] border-[#1D2024]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                agentState === 'speaking'
                  ? 'bg-[#E06D3B] animate-ping'
                  : agentState === 'listening'
                  ? 'bg-emerald-400 animate-pulse'
                  : agentState === 'thinking'
                  ? 'bg-amber-400'
                  : 'bg-zinc-600'
              }`}
            />
            <span className="capitalize">{agentState}</span>
          </span>
        </div>
      </div>

      {/* Center Stage: Video Track or High-Fidelity Photorealistic / Vector Persona */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center py-6">
        {avatarVideoTrack ? (
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-2 border-[#1D2024] shadow-2xl bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="relative group">
            {/* Ambient Pulse Ring */}
            <div
              className={`absolute -inset-4 rounded-full transition-all duration-500 blur-xl ${
                agentState === 'speaking'
                  ? 'bg-gradient-to-tr from-[#E06D3B] to-[#FF9457] opacity-40 animate-pulse'
                  : agentState === 'listening'
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-30'
                  : agentState === 'thinking'
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-400 opacity-25 animate-spin'
                  : 'bg-[#1D2024] opacity-20'
              }`}
            />

            {/* Avatar Holographic Circle */}
            <div
              className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full p-1 bg-gradient-to-b from-[#1D2024] to-[#0C0D0E] border-2 shadow-2xl flex items-center justify-center transition-all duration-300 ${
                agentState === 'speaking'
                  ? 'border-[#E06D3B] shadow-[0_0_40px_rgba(224,109,59,0.35)] scale-102'
                  : agentState === 'listening'
                  ? 'border-emerald-500/60 shadow-[0_0_30px_rgba(52,211,153,0.25)]'
                  : 'border-[#1D2024]'
              }`}
            >
              <div className="w-full h-full rounded-full bg-[#0C0D0E] flex flex-col items-center justify-center relative overflow-hidden">
                {/* Subtle digital grid pattern */}
                <div className="absolute inset-0 bg-radial from-[#1A1D21] to-transparent opacity-80" />

                {/* Animated Avatar Face / Persona Graphic */}
                <div className="relative z-10 flex flex-col items-center space-y-2">
                  <div
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#141619] to-[#22262B] border border-[#1D2024] flex items-center justify-center shadow-inner transition-transform duration-300 ${
                      agentState === 'speaking' ? 'scale-105' : ''
                    }`}
                  >
                    {/* Stylized AI Persona Eye / Neural Aperture */}
                    <div className="relative w-14 h-14 rounded-full bg-[#0C0D0E] border border-[#1D2024] flex items-center justify-center">
                      <div
                        className={`w-6 h-6 rounded-full transition-all duration-300 ${
                          agentState === 'speaking'
                            ? 'bg-[#E06D3B] shadow-[0_0_15px_#E06D3B]'
                            : agentState === 'listening'
                            ? 'bg-emerald-400 shadow-[0_0_12px_#34D399]'
                            : agentState === 'thinking'
                            ? 'bg-amber-400 shadow-[0_0_12px_#FBBF24]'
                            : 'bg-[#7E8078]'
                        }`}
                      />
                    </div>
                  </div>

                  <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-[#C8C6B9]">
                    LIVEKIT VOICE AGENT
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Waveform */}
        <div className="w-full max-w-xs mt-6">
          <AudioVisualizer isSpeaking={agentState === 'speaking'} agentState={agentState} />
        </div>
      </div>

      {/* Bottom Stage Status Footer */}
      <div className="relative z-10 flex items-center justify-between text-xs text-[#7E8078] pt-2 border-t border-[#1D2024]">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-[#E06D3B]" />
          <span>Real-time WebRTC 48kHz Audio</span>
        </div>
        <div className="text-[11px] font-mono">
          {isMuted ? 'Mic Muted' : 'Mic Live & Ready'}
        </div>
      </div>
    </div>
  );
}
