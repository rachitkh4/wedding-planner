export function MarigoldGarland({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 16"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 4 Q 12.5 14 25 4 T 50 4 T 75 4 T 100 4 T 125 4 T 150 4 T 175 4 T 200 4"
        stroke="var(--color-mehendi)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {Array.from({ length: 9 }, (_, i) => i * 25).map((cx) => (
        <circle key={cx} cx={cx} cy="4" r="3.5" fill="var(--color-marigold)" />
      ))}
    </svg>
  );
}
