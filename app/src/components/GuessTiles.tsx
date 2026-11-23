import "./GuessTiles.css";

interface Option {
  id: string;
  label: string;
}

interface GuessTilesProps {
  legend: string;
  options: readonly Option[];
  chosen: string | null;
  answer?: string | null; // omit for votes (no right answer)
  onChoose: (id: string) => void;
}

function resultFor(id: string, chosen: string | null, answer?: string | null) {
  if (!chosen) return undefined;
  if (answer === undefined || answer === null) return id === chosen ? "chosen" : "other";
  if (id === answer) return "answer";
  return id === chosen ? "wrong" : "other";
}

/** Tap-a-tile choice. Native radios give keyboard and screen reader support. Locks after one choice. */
export function GuessTiles({ legend, options, chosen, answer, onChoose }: GuessTilesProps) {
  const name = `guess-${legend.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <fieldset className="guess" role="radiogroup" aria-label={legend}>
      <legend className="sr-only">{legend}</legend>
      {options.map((opt, i) => (
        <label key={opt.id} className="guess-tile" data-result={resultFor(opt.id, chosen, answer)}>
          <input
            type="radio"
            name={name}
            value={opt.id}
            checked={chosen === opt.id}
            disabled={chosen !== null && chosen !== opt.id}
            onChange={() => chosen === null && onChoose(opt.id)}
          />
          <span className="guess-key" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
          <span className="guess-label">{opt.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
