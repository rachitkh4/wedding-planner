/** Marigold and rose petals drifting down. Pure CSS, positions are fixed so it renders the same on server and client. */
const COLORS = ["#e2a63b", "#f2c14e", "#c4455f", "#e8762b", "#f4a6b7"];

export function FallingPetals({ count = 16 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const size = 14 + ((i * 5) % 12);
        return (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className="petal"
            width={size}
            height={size}
            style={
              {
                left: `${(i * 37 + 8) % 96}%`,
                "--dur": `${7 + ((i * 13) % 6)}s`,
                "--delay": `-${(i * 0.9) % 8}s`,
                "--sway": `${((i % 5) - 2) * 36}px`,
              } as React.CSSProperties
            }
          >
            <path d="M10 1 C16 5 17 13 10 19 C3 13 4 5 10 1 Z" fill={COLORS[i % COLORS.length]} opacity="0.92" />
            <path d="M10 3 C10 9 10 13 10 17" stroke="rgb(255 255 255 / 0.35)" strokeWidth="0.7" fill="none" />
          </svg>
        );
      })}
    </div>
  );
}
