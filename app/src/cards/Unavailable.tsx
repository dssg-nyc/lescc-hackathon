export function Unavailable({ error }: { error: string }) {
  return (
    <p className="card-unavailable" role="status">
      Data unavailable for this card. <span className="sr-only">{error}</span>
    </p>
  );
}
