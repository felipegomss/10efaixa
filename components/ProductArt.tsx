import type { Art } from "@/lib/types";

export type ArtView = "front" | "back" | "detail";

export const ART_VIEWS: { label: string; view: ArtView; bg: string }[] = [
  { label: "Frente", view: "front", bg: "#ECEEE8" },
  { label: "Costas", view: "back", bg: "#1B1F1C" },
  { label: "Detalhe", view: "detail", bg: "#C6F41F" },
];

const FALLBACK: Art = { kind: "guard", c1: "#C6F41F", c2: "#0B0D0C" };

/** Ilustração usada enquanto o produto não tem foto. */
export function ProductArt({ art, view = "front", bg = "#ECEEE8", label }: { art: Art | null; view?: ArtView; bg?: string; label?: string }) {
  const { kind, c1, c2, sole = "studs" } = art ?? FALLBACK;
  let transform = "none";
  if (view === "detail") transform = kind === "boot" ? "scale(1.8) translate(-10%, -4%)" : "scale(1.75) translateY(8%)";
  else if (view === "back" && kind !== "jersey") transform = "scaleX(-1)";
  const svgStyle = { width: "78%", height: "78%", overflow: "visible" as const, transform };

  return (
    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden" style={{ background: bg }}>
      {kind === "jersey" && (
        <svg viewBox="0 0 200 200" role="img" aria-label={label ?? "Camisa"} style={svgStyle}>
          <ellipse cx="100" cy="184" rx="60" ry="6" fill="#000" opacity="0.18" />
          <path d="M72 32 Q100 48 128 32 L156 42 L182 70 L162 92 L148 82 L148 172 L52 172 L52 82 L38 92 L18 70 L44 42 Z" fill={c1} stroke={c2} strokeWidth="3" strokeLinejoin="round" />
          <path d="M72 32 Q100 50 128 32" fill="none" stroke={c2} strokeWidth="7" strokeLinecap="round" />
          <path d="M24 76 L42 89 M176 76 L158 89" stroke={c2} strokeWidth="5" strokeLinecap="round" />
          {view === "back" ? (
            <text x="100" y="138" textAnchor="middle" fontSize="62" fontWeight="800" fontStyle="italic" fill={c2} fontFamily="'Barlow Condensed', 'Arial Narrow', sans-serif">10</text>
          ) : (
            <>
              <circle cx="122" cy="72" r="8" fill={c2} />
              <rect x="66" y="68" width="22" height="7" rx="2" fill={c2} opacity="0.7" />
            </>
          )}
        </svg>
      )}
      {kind === "boot" && (
        <svg viewBox="0 0 200 200" role="img" aria-label={label ?? "Chuteira"} style={{ ...svgStyle, width: "82%", height: "82%" }}>
          <ellipse cx="100" cy="150" rx="74" ry="6" fill="#000" opacity="0.18" />
          <path d="M22 122 Q22 98 48 94 L92 88 Q104 60 132 60 L150 62 Q164 64 166 80 L170 112 Q176 128 162 132 L36 134 Q22 133 22 122 Z" fill={c1} stroke={c2} strokeWidth="3" strokeLinejoin="round" />
          <path d="M60 116 Q100 96 150 100" fill="none" stroke={c2} strokeWidth="8" strokeLinecap="round" />
          <path d="M104 78 L120 92 M114 72 L128 86 M124 68 L138 80" stroke={c2} strokeWidth="3" strokeLinecap="round" />
          <rect x="22" y="128" width="150" height="8" rx="4" fill={c2} />
          {sole === "studs" && <path d="M38 136 L42 148 L50 148 L52 136 Z M72 136 L75 148 L83 148 L86 136 Z M128 136 L131 148 L139 148 L142 136 Z M152 136 L155 148 L163 148 L166 136 Z" fill={c2} />}
          {sole === "turf" && <path d="M34 136 h6 v5 h-6z M50 136 h6 v5 h-6z M66 136 h6 v5 h-6z M82 136 h6 v5 h-6z M98 136 h6 v5 h-6z M114 136 h6 v5 h-6z M130 136 h6 v5 h-6z M146 136 h6 v5 h-6z M160 136 h6 v5 h-6z" fill={c2} />}
        </svg>
      )}
      {kind === "ball" && (
        <svg viewBox="0 0 200 200" role="img" aria-label={label ?? "Bola"} style={{ ...svgStyle, width: "74%", height: "74%" }}>
          <ellipse cx="100" cy="176" rx="50" ry="6" fill="#000" opacity="0.18" />
          <circle cx="100" cy="100" r="66" fill={c1} stroke={c2} strokeWidth="3" />
          <path d="M100 76 L122.8 92.6 L114.1 119.4 L85.9 119.4 L77.2 92.6 Z" fill={c2} />
          <path d="M100 76 L100 36 M122.8 92.6 L160 80 M114.1 119.4 L137 152 M85.9 119.4 L63 152 M77.2 92.6 L40 80" stroke={c2} strokeWidth="3" strokeLinecap="round" />
          <path d="M88 36 L112 36 L118 46 L82 46 Z M150 62 L164 76 L160 92 L150 84 Z M50 62 L36 76 L40 92 L50 84 Z M126 156 L146 146 L148 158 L134 164 Z M74 156 L54 146 L52 158 L66 164 Z" fill={c2} opacity="0.85" />
        </svg>
      )}
      {kind === "guard" && (
        <svg viewBox="0 0 200 200" role="img" aria-label={label ?? "Caneleira"} style={svgStyle}>
          <ellipse cx="100" cy="182" rx="44" ry="6" fill="#000" opacity="0.18" />
          <path d="M66 34 Q100 22 134 34 L138 140 Q100 184 62 140 Z" fill={c1} stroke={c2} strokeWidth="3" strokeLinejoin="round" />
          <path d="M78 52 Q100 44 122 52 L124 128 Q100 156 76 128 Z" fill="none" stroke={c2} strokeWidth="5" strokeLinejoin="round" />
          <path d="M88 92 L112 92" stroke={c2} strokeWidth="8" strokeLinecap="round" />
        </svg>
      )}
      {kind === "sock" && (
        <svg viewBox="0 0 200 200" role="img" aria-label={label ?? "Meião"} style={svgStyle}>
          <ellipse cx="116" cy="182" rx="50" ry="6" fill="#000" opacity="0.18" />
          <path d="M78 22 L122 22 L122 120 L156 140 Q172 150 162 168 L98 170 Q76 170 78 146 Z" fill={c1} stroke={c2} strokeWidth="3" strokeLinejoin="round" />
          <rect x="78" y="22" width="44" height="22" fill={c2} />
          <path d="M78 56 L122 56 M78 64 L122 64" stroke={c2} strokeWidth="4" />
          <circle cx="104" cy="150" r="3" fill={c2} />
          <circle cx="118" cy="154" r="3" fill={c2} />
          <circle cx="132" cy="156" r="3" fill={c2} />
          <circle cx="146" cy="158" r="3" fill={c2} />
        </svg>
      )}
    </div>
  );
}
