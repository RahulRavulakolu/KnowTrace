'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TutorMessage, Citation } from '@/types';
import { AvatarStage } from './AvatarStage';
import { VoiceControls } from './VoiceControls';
import { VoiceTranscriptFeed } from './VoiceTranscriptFeed';
import { Room, RoomEvent, Track, RemoteTrackPublication } from 'livekit-client';

interface LiveKitVoiceTutorProps {
  courseId: string;
  courseTitle?: string;
  initialMessages: TutorMessage[];
  onSendMessage: (text: string, allowOutside: boolean) => Promise<void>;
  onCitationClick?: (citation: Citation) => void;
}

export function LiveKitVoiceTutor({
  courseId,
  courseTitle = 'Machine Learning (CS 229)',
  initialMessages,
  onSendMessage,
  onCitationClick,
}: LiveKitVoiceTutorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioOutputMuted, setIsAudioOutputMuted] = useState(false);
  const [agentState, setAgentState] = useState<'connecting' | 'listening' | 'thinking' | 'speaking' | 'idle'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [avatarVideoTrack, setAvatarVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>(initialMessages);

  // Keep messages in sync with parent query updates and prevent duplicates
  useEffect(() => {
    setMessages((prev) => {
      const map = new Map<string, TutorMessage>();
      initialMessages.forEach((m) => map.set(m.id, m));
      prev.forEach((m) => {
        if (!map.has(m.id)) map.set(m.id, m);
      });
      return Array.from(map.values());
    });
  }, [initialMessages]);

  const roomRef = useRef<Room | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Web Speech Fallback for local simulation mode
  const setupSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setAgentState((prev) => (prev === 'speaking' || prev === 'thinking' ? prev : 'listening'));
      };

      recognition.onresult = async (event: any) => {
        const lastIndex = event.results.length - 1;
        const transcriptText = event.results[lastIndex][0].transcript.trim();

        if (transcriptText) {
          // Add User Turn to transcript
          const userTurn: TutorMessage = {
            id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            sender: 'user',
            text: transcriptText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === userTurn.id)) return prev;
            return [...prev, userTurn];
          });
          setAgentState('thinking');

          try {
            // Send turn through KnowTrace grounding pipeline
            await onSendMessage(transcriptText, false);
          } catch (e: any) {
            console.error(e);
          }
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.error('Speech recognition error:', e);
        }
      };

      recognition.onend = () => {
        if (isConnected && !isMuted) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting SpeechRecognition:', err);
    }
  }, [isConnected, isMuted, onSendMessage]);

  // Read aloud new tutor messages when received
  useEffect(() => {
    if (!isConnected || isAudioOutputMuted) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'tutor') {
      setAgentState('speaking');

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(lastMsg.text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        // Try to pick natural voice if available
        const voices = window.speechSynthesis.getVoices();
        const naturalVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
        if (naturalVoice) utterance.voice = naturalVoice;

        utterance.onend = () => {
          setAgentState('listening');
        };

        utterance.onerror = () => {
          setAgentState('listening');
        };

        synthUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } else {
        const timer = setTimeout(() => {
          setAgentState('listening');
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, isConnected, isAudioOutputMuted]);

  // Connect to LiveKit Room
  const handleConnect = async () => {
    try {
      setError(null);
      setAgentState('connecting');

      // Fetch JWT token from token endpoint
      const res = await fetch(`/api/livekit/token?room=knowtrace_${courseId}`);
      if (!res.ok) throw new Error('Failed to obtain LiveKit token');
      const data = await res.json();

      if (data.simulated) {
        // Run with Client Simulation & Browser Speech Engine
        setIsConnected(true);
        setAgentState('listening');
        setupSpeechRecognition();
        return;
      }

      // LiveKit Server connection
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      room
        .on(RoomEvent.TrackSubscribed, (track: Track, publication: RemoteTrackPublication) => {
          if (track.kind === Track.Kind.Video) {
            setAvatarVideoTrack(track.mediaStreamTrack);
          }
          if (track.kind === Track.Kind.Audio) {
            const audioElement = track.attach();
            document.body.appendChild(audioElement);
          }
        })
        .on(RoomEvent.TrackUnsubscribed, (track: Track) => {
          track.detach();
          if (track.kind === Track.Kind.Video) {
            setAvatarVideoTrack(null);
          }
        })
        .on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          const isAgentSpeaking = speakers.some((s) => s.identity.includes('agent') || s.identity.includes('tutor'));
          if (isAgentSpeaking) {
            setAgentState('speaking');
          } else {
            setAgentState('listening');
          }
        })
        .on(RoomEvent.Disconnected, () => {
          setIsConnected(false);
          setAgentState('idle');
        });

      await room.connect(data.serverUrl, data.token);
      await room.localParticipant.setMicrophoneEnabled(true);

      roomRef.current = room;
      setIsConnected(true);
      setAgentState('listening');
    } catch (err: any) {
      console.error('LiveKit connection error:', err);
      // Fallback cleanly to simulation mode so user is never blocked
      setError('LiveKit cloud credentials not detected. Switched to local WebRTC voice simulation.');
      setIsConnected(true);
      setAgentState('listening');
      setupSpeechRecognition();
    }
  };

  const handleDisconnect = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsConnected(false);
    setAgentState('idle');
    setAvatarVideoTrack(null);
  };

  const handleToggleMic = () => {
    if (!isConnected) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (roomRef.current) {
      roomRef.current.localParticipant.setMicrophoneEnabled(!nextMuted);
    }

    if (recognitionRef.current) {
      if (nextMuted) {
        recognitionRef.current.stop();
      } else {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    }
  };

  const handleToggleAudioOutput = () => {
    setIsAudioOutputMuted((prev) => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  return (
    <div className="w-full">
      {/* Side-by-side Avatar & Transcript Layout with viewport height constraint */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-[calc(100vh-14rem)] min-h-[580px] max-h-[820px]">
        {/* Left Column: Avatar Stage & Controls (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-0 space-y-4">
          <div className="flex-1 min-h-0">
            <AvatarStage
              agentState={agentState}
              isMuted={isMuted}
              avatarVideoTrack={avatarVideoTrack}
              agentName="Dr. Julian (KnowTrace AI)"
              courseTitle={courseTitle}
            />
          </div>

          <div className="shrink-0">
            <VoiceControls
              isConnected={isConnected}
              isMuted={isMuted}
              isAudioOutputMuted={isAudioOutputMuted}
              agentState={agentState}
              onToggleMic={handleToggleMic}
              onToggleAudioOutput={handleToggleAudioOutput}
              onDisconnect={handleDisconnect}
              onConnect={handleConnect}
              error={error}
            />
          </div>
        </div>

        {/* Right Column: Live Socratic Transcript & Grounded Citations (5 Cols) */}
        <div className="lg:col-span-5 h-full min-h-0">
          <VoiceTranscriptFeed
            messages={messages}
            onCitationClick={onCitationClick}
            agentState={agentState}
          />
        </div>
      </div>
    </div>
  );
}
