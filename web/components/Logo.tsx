// Brand mark: the letter pi rendered as two classical columns beneath a
// pediment — a Greek temple silhouette that doubles as an estate roofline —
// set inside a fine double ring. Inherits color via currentColor.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="32" cy="32" r="26.4" stroke="currentColor" strokeWidth="0.5" />
      <path
        d="M17.5 30.5 L32 18.5 L46.5 30.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21 35.5 H43" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M26.2 35.5 V46.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M37.8 35.5 V46.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex flex-col leading-none">
      <span
        className={`font-serif text-[1.35rem] font-medium tracking-wide2 ${
          dark ? "text-paper" : "text-ink"
        }`}
      >
        HOMEPI
      </span>
      <span className="mt-1 text-[0.55rem] font-medium uppercase tracking-luxe text-gold">
        Hub&ensp;·&ensp;Fine Property
      </span>
    </span>
  );
}
