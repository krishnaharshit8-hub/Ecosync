"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";

export default function BlurTextAnimation({
  text = "Watch AI agents negotiate energy trades in real time, then verify each one on the Polygon blockchain.",
  words,
  className = "",
  fontSize = "text-lg",
  textColor = "text-white/60",
  animationDelay = 300,
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef(null);
  const resetTimeoutRef = useRef(null);

  const textWords = useMemo(() => {
    if (words) return words;
    const splitWords = text.split(" ");
    const totalWords = splitWords.length;
    return splitWords.map((word, index) => {
      const progress = index / totalWords;
      const exponentialDelay = Math.pow(progress, 0.8) * 0.5;
      const baseDelay = index * 0.06;
      const microVariation = (Math.random() - 0.5) * 0.02;
      return {
        text: word,
        duration: 1.8 + Math.cos(index * 0.3) * 0.3,
        delay: baseDelay + exponentialDelay + microVariation,
        blur: 10 + Math.floor(Math.random() * 6),
        scale: 0.92 + Math.sin(index * 0.2) * 0.04,
      };
    });
  }, [text, words]);

  useEffect(() => {
    const startAnimation = () => {
      // Small delay before words start appearing
      setTimeout(() => setIsAnimating(true), 100);

      // Calculate how long the reveal takes
      let maxTime = 0;
      textWords.forEach((word) => {
        const totalTime = word.delay + word.duration;
        maxTime = Math.max(maxTime, totalTime);
      });

      // Stay fully visible for 5 seconds after reveal completes
      // then blur out
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false); // triggers blur-out transition

        // Wait 3 seconds while blurred out, then restart
        resetTimeoutRef.current = setTimeout(() => {
          startAnimation();
        }, 3000);

      }, (maxTime + 5) * 1000); // maxTime = reveal duration, +5 = visible time
    };

    startAnimation();

    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, [textWords]);

  return (
    <p className={`${textColor} ${fontSize} leading-relaxed tracking-wide text-center max-w-xl mx-auto ${className}`}>
      {textWords.map((word, index) => (
        <span
          key={index}
          className={`inline-block transition-all ${isAnimating ? "opacity-100" : "opacity-0"}`}
          style={{
            transitionDuration: `${word.duration}s`,
            transitionDelay: `${word.delay}s`,
            transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            filter: isAnimating
              ? "blur(0px) brightness(1)"
              : `blur(${word.blur}px) brightness(0.6)`,
            transform: isAnimating
              ? "translateY(0) scale(1)"
              : `translateY(18px) scale(${word.scale || 1})`,
            marginRight: "0.35em",
            willChange: "filter, transform, opacity",
          }}
        >
          {word.text}
        </span>
      ))}
    </p>
  );
}
