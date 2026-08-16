export function ProgressBar({ ratio }: { ratio: number }) {
  const pct = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0)) * 100;
  const overBudget = ratio > 1;

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/8">
      <div
        className={`h-full rounded-full transition-all ${overBudget ? "bg-red-500" : "bg-marigold"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
