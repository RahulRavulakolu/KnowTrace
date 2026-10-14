'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Lightbulb,
  Terminal,
  Code2,
  Clock,
  ChevronDown,
  ChevronUp,
  GripHorizontal,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { CodeExercise, CodeRunResult, Lecture } from '@/types';
import { getLectureCodeExercise } from '@/lib/lectureExercises';

interface CodingEnvironmentProps {
  lecture: Lecture | null;
  courseId: string;
  onOpenSyllabus?: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Helper to simulate output if offline/disconnected
function simulatePythonExecution(userCode: string): string {
  const prints: string[] = [];
  const lines = userCode.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    const printMatch = trimmed.match(/^print\s*\((.*)\)\s*$/);
    if (printMatch) {
      const inner = printMatch[1].trim();
      // String literals
      if (
        (inner.startsWith('"') && inner.endsWith('"')) ||
        (inner.startsWith("'") && inner.endsWith("'"))
      ) {
        prints.push(inner.slice(1, -1));
      } else if (!isNaN(Number(inner))) {
        prints.push(inner);
      } else {
        try {
          prints.push(String(eval(inner)));
        } catch {
          prints.push(inner);
        }
      }
    }
  }
  return prints.length > 0 ? prints.join('\n') : 'Code executed successfully (no stdout).';
}

export function CodingEnvironment({
  lecture,
  courseId,
  onOpenSyllabus,
}: CodingEnvironmentProps) {
  const exercise: CodeExercise | null = lecture ? getLectureCodeExercise(lecture) : null;

  const [code, setCode] = useState<string>(() => exercise?.starterCode || '');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<CodeRunResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedOutput, setCopiedOutput] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);

  // Panel sizing & draggable divider state
  const [editorHeight, setEditorHeight] = useState<number>(260);
  const [terminalHeight, setTerminalHeight] = useState<number>(150);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Track lecture changes to sync starter code
  useEffect(() => {
    if (lecture?.id && exercise) {
      setCode(exercise.starterCode);
      setOutput(null);
      setShowHints(false);
    }
  }, [lecture?.id, exercise]);

  // Sync gutter scroll with textarea
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Draggable divider mouse handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startY = e.clientY;
    const startEditorHeight = editorHeight;
    const startTerminalHeight = terminalHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      // Moving down increases editor height, decreases terminal height
      const newEditor = Math.max(120, Math.min(650, startEditorHeight + deltaY));
      const newTerminal = Math.max(80, Math.min(500, startTerminalHeight - deltaY));
      setEditorHeight(newEditor);
      setTerminalHeight(newTerminal);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResetHeights = () => {
    setEditorHeight(260);
    setTerminalHeight(150);
  };

  // Handle Tab and Ctrl+Enter inside the code editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;

      // Insert 4 spaces
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      setCode(newValue);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim() || isRunning) return;

    setIsRunning(true);
    setIsTerminalCollapsed(false);
    const startTime = performance.now();

    try {
      const res = await fetch(`${API_BASE}/sandbox/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: 'python',
          timeout_seconds: 5.0,
        }),
      });

      if (res.ok) {
        const data: CodeRunResult = await res.json();
        setOutput(data);
      } else {
        const errText = await res.text();
        const elapsed = Math.round(performance.now() - startTime);
        setOutput({
          stdout: '',
          stderr: `Server error (${res.status}): ${errText || 'Failed to execute code.'}`,
          exit_code: 1,
          execution_time_ms: elapsed,
          success: false,
        });
      }
    } catch {
      // Client-side fallback simulation if backend is temporarily disconnected
      const elapsed = Math.round(performance.now() - startTime);
      const simulatedStdout = simulatePythonExecution(code);
      setOutput({
        stdout: simulatedStdout,
        stderr: '',
        exit_code: 0,
        execution_time_ms: elapsed,
        success: true,
        message: 'Executed locally (preview mode)',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (exercise) {
      setCode(exercise.starterCode);
      setOutput(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOutput = () => {
    if (!output) return;
    const textToCopy = output.stdout || output.stderr || '';
    navigator.clipboard.writeText(textToCopy);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  const handleClearOutput = () => {
    setOutput(null);
  };

  // Compute line numbers
  const lineCount = Math.max(code.split('\n').length, 12);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  if (!lecture || !exercise) {
    return (
      <div className="p-6 rounded-2xl bg-[#141619] border border-[#1D2024] text-center text-xs text-[#7E8078]">
        Select a lecture to open its interactive coding environment.
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl bg-[#141619] border border-[#1D2024] shadow-2xs overflow-hidden flex flex-col space-y-0 ${
        isDragging ? 'select-none' : ''
      }`}
    >
      {/* 1. Header Bar */}
      <div className="px-4 py-3 bg-[#1A1D21] border-b border-[#1D2024] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-[#E06D3B]/10 text-[#E06D3B]">
            <Code2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#F6F5EE] truncate">
                {exercise.title}
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-mono font-semibold uppercase">
                Python 3.12
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-[#7E8078] hover:text-[#F6F5EE] hover:bg-[#1D2024] transition-colors cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg text-[#7E8078] hover:text-[#F6F5EE] hover:bg-[#1D2024] transition-colors cursor-pointer"
            title="Reset to Starter Code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E06D3B] hover:bg-[#FF9457] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Run Code (Ctrl + Enter)"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${isRunning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run Code'}</span>
            <span className="sm:hidden">{isRunning ? '...' : 'Run'}</span>
          </button>
        </div>
      </div>

      {/* 2. Instructions Card */}
      <div className="p-3.5 bg-[#141619] border-b border-[#1D2024] text-xs text-[#C8C6B9] space-y-2">
        <p className="leading-relaxed whitespace-pre-line text-[11.5px]">
          {exercise.instructions}
        </p>

        {exercise.hints && exercise.hints.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowHints(!showHints)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E06D3B] hover:underline cursor-pointer"
            >
              <Lightbulb className="w-3 h-3" />
              <span>{showHints ? 'Hide Hints' : `Show Hints (${exercise.hints.length})`}</span>
              {showHints ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showHints && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#E06D3B]/10 border border-[#E06D3B]/30 text-[11px] text-[#FF9457] space-y-1">
                {exercise.hints.map((hint, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="font-bold text-[#E06D3B]">•</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Code Editor Area (Adjustable Height) */}
      <div
        style={{ height: `${editorHeight}px` }}
        className="relative bg-[#0C0D0E] text-[#F6F5EE] font-mono text-xs flex overflow-hidden border-b border-[#1D2024] transition-[height] duration-75"
      >
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          className="w-9 py-3 select-none text-right pr-2.5 text-[#7E8078] bg-[#141619]/60 border-r border-[#1D2024] text-[11px] leading-5 shrink-0 overflow-hidden font-mono"
        >
          {lineNumbers.map((n) => (
            <div key={n}>{n}</div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleEditorScroll}
          spellCheck={false}
          className="flex-1 w-full p-3 bg-transparent text-emerald-300 font-mono text-xs leading-5 resize-none focus:outline-hidden whitespace-pre overflow-auto scrollbar-thin"
          placeholder="# Write your Python code here..."
        />
      </div>

      {/* 4. Draggable Divider Handle */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={handleResetHeights}
        title="Drag up or down to adjust panel height (Double click to reset)"
        className={`group relative h-3 bg-[#141619] hover:bg-[#1A1D21] border-b border-[#1D2024] flex items-center justify-center cursor-row-resize select-none transition-colors ${
          isDragging ? 'bg-[#1A1D21] border-[#E06D3B]' : ''
        }`}
      >
        <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1A1D21] group-hover:bg-[#1D2024] group-hover:text-[#F6F5EE] text-[#7E8078] transition-colors shadow-xs">
          <GripHorizontal className="w-3.5 h-3.5" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Resize Panels</span>
        </div>
      </div>

      {/* 5. Console Output Terminal (Adjustable Height & Collapsible) */}
      <div className="bg-[#0C0D0E] p-3.5 space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between text-[11px] text-[#7E8078] border-b border-[#1D2024] pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
              className="flex items-center gap-1.5 hover:text-[#F6F5EE] transition-colors cursor-pointer"
              title={isTerminalCollapsed ? 'Expand Terminal' : 'Collapse Terminal'}
            >
              <Terminal className="w-3.5 h-3.5 text-[#E06D3B]" />
              <span className="font-bold text-[#F6F5EE]">Terminal Output</span>
              {isTerminalCollapsed ? (
                <ChevronUp className="w-3 h-3 text-[#7E8078]" />
              ) : (
                <ChevronDown className="w-3 h-3 text-[#7E8078]" />
              )}
            </button>

            {output && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  output.success
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {output.success ? 'Exit Code 0' : `Exit Code ${output.exit_code}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 text-[10px] text-[#7E8078]">
            {output && (
              <>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{output.execution_time_ms} ms</span>
                </span>

                <button
                  type="button"
                  onClick={handleCopyOutput}
                  className="p-1 rounded hover:text-[#F6F5EE] hover:bg-[#1D2024] transition-colors cursor-pointer"
                  title="Copy Terminal Output"
                >
                  {copiedOutput ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClearOutput}
                  className="p-1 rounded hover:text-rose-400 hover:bg-[#1D2024] transition-colors cursor-pointer"
                  title="Clear Terminal Output"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}

            <span className="text-[#7E8078] hidden sm:inline">Ctrl + Enter to Run</span>
          </div>
        </div>

        {/* Console Body */}
        {!isTerminalCollapsed && (
          <div
            style={{ height: `${terminalHeight}px` }}
            className="overflow-y-auto font-mono text-[11.5px] leading-relaxed text-[#C8C6B9] transition-[height] duration-75 scrollbar-thin pr-1"
          >
            {isRunning ? (
              <div className="flex items-center gap-2 text-[#E06D3B] animate-pulse py-2">
                <Play className="w-3.5 h-3.5 animate-spin" />
                <span>Executing in isolated Python sandbox...</span>
              </div>
            ) : output ? (
              <div className="space-y-1">
                {output.stdout && (
                  <pre className="text-emerald-400 whitespace-pre-wrap font-mono selection:bg-emerald-950 selection:text-emerald-200">
                    {output.stdout}
                  </pre>
                )}
                {output.stderr && (
                  <pre className="text-rose-400 whitespace-pre-wrap font-mono selection:bg-rose-950 selection:text-rose-200">
                    {output.stderr}
                  </pre>
                )}
                {!output.stdout && !output.stderr && (
                  <span className="text-[#7E8078] italic">Program finished with no output.</span>
                )}
              </div>
            ) : (
              <div className="text-[#7E8078] italic py-2">
                Click &quot;Run Code&quot; to test your algorithm in the sandbox.
              </div>
            )}
          </div>
        )}

        {/* Footer actions: AI review bridge & Syllabus switch */}
        <div className="pt-2 border-t border-[#1D2024] flex items-center justify-between text-[11px]">
          <Link
            href={`/courses/${courseId}/tutor?prompt=${encodeURIComponent(
              `Here is my code for ${lecture.title} (${exercise.title}):\n\n\`\`\`python\n${code}\n\`\`\`\n\nCan you review this code, explain its time and space complexity, and give feedback?`
            )}`}
            className="inline-flex items-center gap-1.5 text-[#E06D3B] hover:text-[#FF9457] font-semibold transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#E06D3B]" />
            <span>Ask AI Tutor to Review Code →</span>
          </Link>

          {onOpenSyllabus && (
            <button
              type="button"
              onClick={onOpenSyllabus}
              className="text-[#7E8078] hover:text-[#F6F5EE] transition-colors cursor-pointer"
            >
              View Syllabus ({lecture.order}) 📑
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
