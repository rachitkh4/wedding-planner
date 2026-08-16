import { Card } from "./Card";

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</span>
      <span className="font-mono text-2xl font-semibold text-maroon">{value}</span>
      {sub && <span className="text-xs text-ink/50">{sub}</span>}
    </Card>
  );
}
