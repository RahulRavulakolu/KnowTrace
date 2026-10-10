'use client';

import React from 'react';
import { Citation } from '@/types';

interface MarkdownRendererProps {
  content: string;
  citations?: Citation[];
  onCitationClick?: (citation: Citation) => void;
  className?: string;
}

/**
 * Format math expression strings like \text{Precision} = \frac{TP}{TP + FP}
 * into readable mathematical typography.
 */
function formatMathFormula(math: string): string {
  let cleaned = math.trim();
  // Replace \text{...} with the inner text
  cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, '$1');
  // Replace \frac{a}{b} with a / (b)
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / ($2))');
  // Replace common LaTeX symbols
  cleaned = cleaned.replace(/\\times/g, '×');
  cleaned = cleaned.replace(/\\approx/g, '≈');
  cleaned = cleaned.replace(/\\leq/g, '≤');
  cleaned = cleaned.replace(/\\geq/g, '≥');
  cleaned = cleaned.replace(/\\neq/g, '≠');
  cleaned = cleaned.replace(/\\cdot/g, '·');
  cleaned = cleaned.replace(/\\in/g, '∈');
  cleaned = cleaned.replace(/\\forall/g, '∀');
  cleaned = cleaned.replace(/\\rightarrow/g, '→');
  return cleaned;
}

/**
 * Parses inline formatting:
 * - Math: $...$
 * - Bold: **...**
 * - Inline Code: `...`
 * - Citations: [S1], [S2]
 * - Italic: *...*
 */
function renderInlineFormatting(
  text: string,
  citations?: Citation[],
  onCitationClick?: (c: Citation) => void
): React.ReactNode[] {
  // Regex to match math ($...$), bold (**...**), code (`...`), citations ([S\d+]), italic (*...*)
  const regex = /(\$[^$]+\$|\*\*[^*]+\*\*|`[^`]+`|\[S\d+\]|\*[^*]+\*)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline Math: $...$
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const mathInner = part.slice(1, -1);
      const formatted = formatMathFormula(mathInner);
      return (
        <span
          key={index}
          className="inline-flex items-center px-1.5 py-0.5 mx-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[12px] font-medium border border-indigo-200/60 dark:border-indigo-800/60 align-baseline select-all"
        >
          {formatted}
        </span>
      );
    }

    // Bold: **...**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-zinc-900 dark:text-zinc-100">
          {boldText}
        </strong>
      );
    }

    // Inline Code: `...`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeText = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs border border-zinc-200/60 dark:border-zinc-700/60"
        >
          {codeText}
        </code>
      );
    }

    // Citation tag: [S1], [S2]
    const citationMatch = part.match(/^\[S(\d+)\]$/);
    if (citationMatch) {
      const citIdx = parseInt(citationMatch[1], 10) - 1;
      const matchedCitation = citations && citations[citIdx] ? citations[citIdx] : null;

      if (matchedCitation && onCitationClick) {
        return (
          <button
            key={index}
            type="button"
            onClick={() => onCitationClick(matchedCitation)}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 mx-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-mono font-bold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors cursor-pointer border border-indigo-300 dark:border-indigo-700 align-baseline"
            title={`View Source: ${matchedCitation.sourceTitle}`}
          >
            {part}
          </button>
        );
      }
      return (
        <span
          key={index}
          className="inline-block px-1.5 py-0.2 mx-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-mono font-semibold"
        >
          {part}
        </span>
      );
    }

    // Italic: *...*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic text-zinc-700 dark:text-zinc-300">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export function MarkdownRenderer({
  content,
  citations,
  onCitationClick,
  className = '',
}: MarkdownRendererProps) {
  if (!content) return null;

  // Split into lines/paragraphs
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ol' | 'ul'; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    if (currentList.type === 'ol') {
      elements.push(
        <ol key={`list-${elements.length}`} className="my-2.5 space-y-2 list-none pl-0">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                {renderInlineFormatting(item, citations, onCitationClick)}
              </div>
            </li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2.5 space-y-1.5 list-none pl-0">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
              <div className="flex-1 min-w-0">
                {renderInlineFormatting(item, citations, onCitationClick)}
              </div>
            </li>
          ))}
        </ul>
      );
    }
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    // Numbered List: 1. Item or 1) Item
    const olMatch = line.match(/^(\d+)[\.\)]\s+(.+)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[2]);
      continue;
    }

    // Bullet List: - Item or * Item (but not bold **)
    const ulMatch = line.match(/^[-*•]\s+(.+)$/);
    if (ulMatch && !line.startsWith('**')) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Not a list item: flush any pending list
    flushList();

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h4
          key={`h4-${i}`}
          className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-3 mb-1"
        >
          {renderInlineFormatting(line.slice(4), citations, onCitationClick)}
        </h4>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-3.5 mb-1.5"
        >
          {renderInlineFormatting(line.slice(3), citations, onCitationClick)}
        </h3>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-3 border-indigo-500 pl-3 py-1 my-2 text-xs italic text-zinc-600 dark:text-zinc-300 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-r"
        >
          {renderInlineFormatting(line.slice(2), citations, onCitationClick)}
        </blockquote>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-sm leading-relaxed text-inherit">
        {renderInlineFormatting(line, citations, onCitationClick)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}
