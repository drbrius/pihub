// Deterministic placeholder artwork used until real photo uploads land in
// Phase 2. Rich tonal duotones — charcoal bronze, deep emerald, midnight,
// mahogany, aubergine — keep the cards feeling like a curated collection
// while staying fully self-contained (no external images).
const PALETTES: [string, string][] = [
  ["#1e1b15", "#3f382a"], // charcoal bronze
  ["#101f19", "#2b473c"], // deep emerald
  ["#131826", "#2b3a58"], // midnight
  ["#231712", "#4a3128"], // mahogany
  ["#1d1620", "#3b2f4e"], // aubergine
  ["#1c1c14", "#42402c"], // dark olive
];

export function placeholderStyle(seed: string | null | undefined) {
  let hash = 0;
  for (const ch of seed ?? "pi") hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const [from, to] = PALETTES[hash % PALETTES.length];
  return {
    background: `radial-gradient(120% 120% at 20% 0%, ${to}, ${from})`,
  };
}

export function typeLabel(type: string) {
  switch (type) {
    case "COMMERCIAL":
      return "Commercial";
    case "LAND":
      return "Land & Estate";
    default:
      return "Residence";
  }
}
