import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import "./StoryShell.css";

const SWIPE_MIN_PX = 40;

interface ShellCard {
  readonly id: string;
  readonly label: string;
}

interface StoryShellProps {
  cards: readonly ShellCard[];
  index: number;
  go: (next: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
  onInfo: () => void;
  onClose: () => void;
  children: ReactNode;
}

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.closest("dialog, input, textarea, select") !== null);
}

export function StoryShell({ cards, index, go, playing, onTogglePlay, onInfo, onClose, children }: StoryShellProps) {
  const last = cards.length - 1;
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  const onPointerDown = (event: PointerEvent) => {
    start.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent) => {
    if (!start.current) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? index + 1 : index - 1);
  };

  return (
    <section className="shell" aria-roledescription="story">
      <nav className="shell-progress" aria-label="Story progress">
        {cards.map((card, i) => (
          <button
            key={card.id}
            type="button"
            className="shell-seg"
            data-state={i < index ? "done" : i === index ? "current" : "todo"}
            data-playing={i === index && playing ? "true" : undefined}
            aria-label={`Go to card ${i + 1}: ${card.label}`}
            aria-current={i === index ? "step" : undefined}
            onClick={() => go(i)}
          >
            <span className="shell-seg-fill" />
          </button>
        ))}
      </nav>

      <div className="shell-header">
        <p className="shell-label">{cards[index]?.label}</p>
        <div className="shell-actions">
          <button type="button" className="shell-icon" aria-label="Sources and method" onClick={onInfo}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></svg>
          </button>
          <button type="button" className="shell-icon" aria-label={playing ? "Pause story" : "Play story"} onClick={onTogglePlay}>
            {playing ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" /></svg>
            )}
          </button>
          <button type="button" className="shell-icon" aria-label="Close story" onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </div>

      <div
        className="shell-card-region"
        data-testid="story-card-region"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {children}
      </div>

      <div className="shell-nav">
        <button type="button" className="shell-arrow" aria-label="Previous card" disabled={index === 0} onClick={() => go(index - 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <span className="shell-count" aria-hidden="true">
          {String(index + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
        </span>
        <button type="button" className="shell-arrow" aria-label="Next card" disabled={index === last} onClick={() => go(index + 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  );
}
