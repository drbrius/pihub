// Deterministic gradient + glyph placeholders used until real photo uploads
// land in Phase 2. Keeps the app fully self-contained (no external images).
export function placeholderStyle(seed: string | null | undefined) {
  let hash = 0;
  for (const ch of seed ?? "pi") hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const h1 = hash % 360;
  const h2 = (h1 + 40) % 360;
  return {
    background: `linear-gradient(135deg, hsl(${h1} 65% 55%), hsl(${h2} 70% 40%))`,
  };
}

export function typeGlyph(type: string) {
  switch (type) {
    case "COMMERCIAL":
      return "🏢";
    case "LAND":
      return "🌍";
    default:
      return "🏠";
  }
}
