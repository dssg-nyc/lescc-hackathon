import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import "./CountUp.css";

const DEFAULT_DURATION_MS = 1500; // measured from the reference, docs/311wrapped-motion.md
const DIGITS = "0123456789";

interface CountUpProps {
  value: number | null;
  durationMs?: number;
  format?: (n: number) => string;
}

const formatDefault = (n: number) => Math.round(n).toLocaleString("en-US");

// easeOutQuint approximates the story ease cubic-bezier(.22,1,.36,1)
const ease = (t: number) => 1 - Math.pow(1 - t, 5);

export function CountUp({ value, durationMs = DEFAULT_DURATION_MS, format = formatDefault }: CountUpProps) {
  const reduce = usePrefersReducedMotion();
  const [animated, setAnimated] = useState<number>(0);

  useEffect(() => {
    if (value === null || reduce) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      setAnimated(value * ease(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs, reduce]);

  if (value === null) return <span className="countup countup-awaiting">Awaiting data</span>;

  const shown = reduce ? value : animated;

  const finalText = format(value);
  // Pad to the final width so columns do not jump while counting.
  const text = format(shown).padStart(finalText.length, "0");

  return (
    <span className="countup">
      <span className="sr-only" data-testid="countup-final">{finalText}</span>
      <span className="countup-visual" aria-hidden="true" data-testid="countup-visual" data-value={text}>
        {[...text].map((ch, i) =>
          DIGITS.includes(ch) ? (
            <span className="countup-col" key={i}>
              <span className="countup-reel" style={{ transform: `translateY(-${Number(ch) * 10}%)` }}>
                {[...DIGITS].map((d) => <span key={d}>{d}</span>)}
              </span>
            </span>
          ) : (
            <span key={i}>{ch}</span>
          ),
        )}
      </span>
    </span>
  );
}
