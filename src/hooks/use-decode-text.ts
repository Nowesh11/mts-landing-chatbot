import { useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01#$%&*+=-/\\";

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

/**
 * Decodes `text` from random scrambled characters into the real string,
 * resolving left-to-right, staggered per character. Runs once when `start`
 * flips true.
 */
export function useDecodeText(text: string, start: boolean, durationMs = 1200) {
  // Initial render must match the server (plain text) to avoid a hydration
  // mismatch — the scramble is applied client-side only, once mounted.
  const [display, setDisplay] = useState(text);
  const hasRun = useRef(false);
  const hasScrambled = useRef(false);

  useEffect(() => {
    if (hasScrambled.current || hasRun.current) return;
    hasScrambled.current = true;
    setDisplay(text.replace(/[^\s]/g, () => randomChar()));
  }, [text]);

  useEffect(() => {
    if (!start || hasRun.current) return;
    hasRun.current = true;

    const chars = text.split("");
    const lockAt = chars.map((_, i) =>
      (i / chars.length) * durationMs * 0.7 + Math.random() * (durationMs * 0.3)
    );

    const startTime = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      setDisplay(
        chars
          .map((c, i) => {
            if (c === " ") return " ";
            if (elapsed >= lockAt[i]) return c;
            return randomChar();
          })
          .join("")
      );
      if (elapsed < durationMs) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, text, durationMs]);

  return display;
}
