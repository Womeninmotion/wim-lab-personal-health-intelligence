export function Meter({ value, label }: { value: number; label: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div
      className="h-1 bg-paper"
      role="progressbar"
      aria-valuenow={Math.round(width)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="h-full bg-orange" style={{ width: `${width}%` }} />
    </div>
  );
}
