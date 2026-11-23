import { useEffect, useRef } from "react";

export interface SheetSource {
  name: string;
  url: string | null;
  pulled: string | null;
}

interface SourceSheetProps {
  open: boolean;
  title: string;
  caveat: string;
  dataFile: string | null;
  sources?: readonly SheetSource[];
  onClose: () => void;
}

/** Info sheet: sources, pull dates, caveat. Native <dialog> handles focus and Esc. */
export function SourceSheet({ open, title, caveat, dataFile, sources = [], onClose }: SourceSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || typeof dialog.showModal !== "function") return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="source-sheet" onClose={onClose} aria-labelledby="source-sheet-title">
      <h2 id="source-sheet-title">Sources · {title}</h2>
      <p>{caveat}</p>
      {sources.length > 0 && (
        <ul className="source-list">
          {sources.map((s) => (
            <li key={s.name}>
              {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a> : s.name}
              {s.pulled && <span className="source-file"> · pulled {s.pulled}</span>}
            </li>
          ))}
        </ul>
      )}
      <p className="source-file">{dataFile ? `Data file: ${dataFile}` : "No data file. Text only."}</p>
      <button type="button" className="btn btn-primary" onClick={onClose}>
        Close
      </button>
    </dialog>
  );
}
