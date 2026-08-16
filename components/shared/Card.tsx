export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-ink/10 bg-white/70 p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
