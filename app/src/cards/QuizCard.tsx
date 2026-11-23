import { useState } from "react";
import { CountUp } from "../components/CountUp";
import { GuessTiles } from "../components/GuessTiles";
import type { StoryData } from "../data/schema";

export function QuizCard({ data, onAnswered }: { data: StoryData["quiz.json"]; onAnswered: () => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const choose = (id: string) => {
    setChosen(id);
    onAnswered();
  };
  const right = chosen !== null && chosen === data.answer;
  return (
    <>
      <GuessTiles legend="Your guess" options={data.options} chosen={chosen} answer={data.answer} onChoose={choose} />
      {chosen === null ? (
        <p className="card-meta">Tap a tile to guess.</p>
      ) : (
        <div className="quiz-reveal" aria-live="polite">
          <p className="quiz-verdict">{right ? "Right." : "Not quite."}</p>
          <dl className="quiz-counts">
            {data.options.map((o) => (
              <div key={o.id}>
                <dt>{o.label}</dt>
                <dd className="card-number-sm"><CountUp value={o.count} /></dd>
              </div>
            ))}
          </dl>
          {data.ratio !== null && <p className="card-sub">About {data.ratio} to 1.</p>}
        </div>
      )}
    </>
  );
}
