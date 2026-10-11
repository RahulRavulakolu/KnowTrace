'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
}

export const WordsPullUp: React.FC<WordsPullUpProps> = ({
  text,
  className = '',
  showAsterisk = false,
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });
  const words = text.split(' ');

  return (
    <h1
      ref={containerRef}
      className={`inline-flex flex-nowrap items-baseline whitespace-nowrap ${className}`}
      style={{ color: '#E1E0CC' }}
    >
      {words.map((word, wordIdx) => {
        const isLastWord = wordIdx === words.length - 1;

        if (showAsterisk && isLastWord) {
          // Separate last character to attach the superscript asterisk
          const mainPart = word.slice(0, -1);
          const lastChar = word.slice(-1);

          return (
            <motion.span
              key={wordIdx}
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{
                duration: 0.7,
                delay: wordIdx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="inline-block relative mr-[0.2em] last:mr-0 select-none whitespace-nowrap"
            >
              <span>{mainPart}</span>
              <span className="relative inline-block">
                {lastChar}
                <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em] leading-none pointer-events-none">
                  *
                </span>
              </span>
            </motion.span>
          );
        }

        return (
          <motion.span
            key={wordIdx}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{
              duration: 0.7,
              delay: wordIdx * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block mr-[0.2em] last:mr-0 select-none"
          >
            {word}
          </motion.span>
        );
      })}
    </h1>
  );
};

export default WordsPullUp;
