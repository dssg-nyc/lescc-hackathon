import { useEffect, useRef } from "react";

interface SourceSheetProps {
  open: boolean;
  title: string;
  caveat: string;
  dataFile: string | null;
  onClose: () => void;
}

/** Info sheet: sources, pull dates, method. Native <dialog> handles focus and Esc. */
export function SourceSheet({ open, title, caveat, dataFile, onClose }: SourceSheetProps) {
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
      <p className="source-file">{dataFile ? `Data file: ${dataFile}` : "No data file. Text only."}</p>
      <button type="button" className="btn btn-primary" onClick={onClose}>
        Close
      </button>
    </dialog>
  );
}
