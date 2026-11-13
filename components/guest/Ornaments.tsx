/** Decorative SVGs for the guest app. All original artwork. */

/** A toran: marigold strings and mango leaves hanging from the top edge. */
export function Toran({ className = "" }: { className?: string }) {
  const strands = Array.from({ length: 13 }, (_, i) => i);
  return (
    <svg viewBox="0 0 390 70" preserveAspectRatio="none" className={className} aria-hidden="true">
      <rect x="0" y="0" width="390" height="5" fill="var(--color-maroon)" />
      <path
        d="M0 6 Q 15 18 30 6 T 60 6 T 90 6 T 120 6 T 150 6 T 180 6 T 210 6 T 240 6 T 270 6 T 300 6 T 330 6 T 360 6 T 390 6"
        stroke="var(--color-mehendi)"
        strokeWidth="2"
        fill="none"
      />
      {strands.map((i) => {
        const x = 15 + i * 30;
        const long = i % 2 === 0;
        const beads = long ? 4 : 2;
        return (
          <g key={i}>
            <line x1={x} y1="8" x2={x} y2={long ? 52 : 30} stroke="#b88a2c" strokeWidth="0.8" />
            {Array.from({ length: beads }, (_, b) => (
              <circle
                key={b}
                cx={x}
                cy={14 + b * 10}
                r="4.6"
                fill={b % 2 === 0 ? "var(--color-marigold)" : "#e8762b"}
              />
            ))}
            {/* mango leaf */}
            <path
              d={`M${x} ${long ? 52 : 30} q -5 8 0 16 q 5 -8 0 -16 z`}
              fill="var(--color-mehendi)"
            />
          </g>
        );
      })}
    </svg>
  );
}

/** A small mandala-like flourish used as a section divider. */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 24" className={className} aria-hidden="true">
      <line x1="0" y1="12" x2="88" y2="12" stroke="var(--color-marigold)" strokeWidth="1" />
      <line x1="132" y1="12" x2="220" y2="12" stroke="var(--color-marigold)" strokeWidth="1" />
      <g transform="translate(110 12)">
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            rx="3"
            ry="9"
            transform={`rotate(${i * 45}) translate(0 -5)`}
            fill={i % 2 ? "var(--color-marigold)" : "var(--color-maroon)"}
            opacity={i % 2 ? 0.9 : 0.75}
          />
        ))}
        <circle r="3.2" fill="var(--color-ivory)" stroke="var(--color-maroon)" strokeWidth="1" />
      </g>
      <circle cx="80" cy="12" r="2" fill="var(--color-maroon)" />
      <circle cx="140" cy="12" r="2" fill="var(--color-maroon)" />
    </svg>
  );
}

/** A simple kalash with coconut and mango leaves: an auspicious opening mark. */
export function Kalash({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 72" className={className} aria-hidden="true">
      <path d="M22 22 q -10 -10 -14 -2 q 8 2 14 6z" fill="var(--color-mehendi)" />
      <path d="M42 22 q 10 -10 14 -2 q -8 2 -14 6z" fill="var(--color-mehendi)" />
      <path d="M26 20 q -4 -12 -10 -12 q 2 8 10 14z" fill="#8a9a5f" />
      <path d="M38 20 q 4 -12 10 -12 q -2 8 -10 14z" fill="#8a9a5f" />
      <ellipse cx="32" cy="14" rx="8" ry="9" fill="#a0652d" />
      <path d="M26 10 q 6 -6 12 0" stroke="#7a4a1f" strokeWidth="1" fill="none" />
      <rect x="22" y="22" width="20" height="5" rx="2" fill="var(--color-marigold)" />
      <path
        d="M24 27 C 6 34 6 62 20 68 L44 68 C 58 62 58 34 40 27 Z"
        fill="#c98a2a"
        stroke="var(--color-maroon)"
        strokeWidth="1.2"
      />
      <path d="M14 46 H50" stroke="var(--color-maroon)" strokeWidth="2" />
      <path d="M32 38 v16 M24 46 h16" stroke="var(--color-maroon)" strokeWidth="2.2" />
      <path d="M26 40 l12 12 M38 40 l-12 12" stroke="var(--color-maroon)" strokeWidth="1" />
    </svg>
  );
}
