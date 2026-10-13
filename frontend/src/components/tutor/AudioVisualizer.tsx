'use client';

import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isSpeaking: boolean;
  agentState: 'connecting' | 'listening' | 'thinking' | 'speaking' | 'idle';
  volume?: number;
}

export function AudioVisualizer({ isSpeaking, agentState, volume = 0.5 }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw subtle horizon baseline
      ctx.beginPath();
      ctx.strokeStyle = '#1D2024';
      ctx.lineWidth = 1;
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Number of bars
      const numBars = 36;
      const barWidth = 3;
      const gap = (width - numBars * barWidth) / (numBars - 1);

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + gap);
        let barHeight = 4;

        if (agentState === 'speaking') {
          // Dynamic harmonic terracotta waveform
          const wave = Math.sin(i * 0.35 + phase) * Math.cos(i * 0.15 + phase * 0.8);
          barHeight = Math.max(4, Math.abs(wave) * (36 * volume) + 6);
        } else if (agentState === 'listening') {
          // Subtle responsive emerald/cyan pulse for user mic
          const pulse = Math.sin(i * 0.2 + phase * 0.5);
          barHeight = Math.max(3, Math.abs(pulse) * 14 + 3);
        } else if (agentState === 'thinking') {
          // Traveling wave for inference
          const traveling = Math.sin(i * 0.4 - phase * 1.5);
          barHeight = Math.max(3, Math.abs(traveling) * 16 + 2);
        }

        const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
        if (agentState === 'speaking') {
          gradient.addColorStop(0, '#FF9457');
          gradient.addColorStop(0.5, '#E06D3B');
          gradient.addColorStop(1, '#9E3B1B');
        } else if (agentState === 'listening') {
          gradient.addColorStop(0, '#34D399');
          gradient.addColorStop(1, '#059669');
        } else if (agentState === 'thinking') {
          gradient.addColorStop(0, '#FBBF24');
          gradient.addColorStop(1, '#D97706');
        } else {
          gradient.addColorStop(0, '#2A2E33');
          gradient.addColorStop(1, '#1A1D20');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Rounded bars
        ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2);
        ctx.fill();
      }

      phase += 0.08;
      animIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [isSpeaking, agentState, volume]);

  return (
    <div className="w-full flex items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={320}
        height={50}
        className="w-full max-w-[320px] h-[44px]"
      />
    </div>
  );
}
