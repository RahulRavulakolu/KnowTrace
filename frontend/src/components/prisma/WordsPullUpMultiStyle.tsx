'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export interface TextSegment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: TextSegment[];
  className?: string;
}

export const WordsPullUpMultiStyle: React.FC<WordsPullUpMultiStyleProps> = ({
  segments,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  // Flatten segments into an array of individual word objects while retaining their styling
  let globalWordIndex = 0;
  const wordTokens: Array<{
    id: number;
    word: string;
    className: string;
  }> = [];

  segments.forEach((segment) => {
    const splitWords = segment.text.trim().split(/\s+/);
    splitWords.forEach((word) => {
      if (word.length > 0) {
        wordTokens.push({
          id: globalWordIndex++,
          word,
          className: segment.className || '',
        });
      }
    });
  });

  return (
    <div
      ref={containerRef}
      className={`inline-flex flex-wrap justify-center ${className}`}
      style={{ color: '#E1E0CC' }}
    >
      {wordTokens.map((item) => (
        <motion.span
          key={item.id}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{
            duration: 0.65,
            delay: item.id * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`inline-block mr-[0.28em] last:mr-0 select-none ${item.className}`}
        >
          {item.word}
        </motion.span>
      ))}
    </div>
  );
};

export default WordsPullUpMultiStyle;
