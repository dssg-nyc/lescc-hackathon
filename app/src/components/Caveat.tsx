interface CaveatProps {
  text: string;
  onSources: () => void;
}

/** One-line caveat under every number. Opens the source sheet. */
export function Caveat({ text, onSources }: CaveatProps) {
  return (
    <p className="caveat">
      {text}{" "}
      <button type="button" className="caveat-src" onClick={onSources}>
        Sources
      </button>
    </p>
  );
}
