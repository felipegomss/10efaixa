/** Assinatura "10 E FAIXA" em caixa, como aplicada no peito da camisa. */
export function Wordmark({ size = 26, framed = true }: { size?: number; framed?: boolean }) {
  return (
    <span
      className="inline-flex shrink-0 items-center whitespace-nowrap bg-ink font-display font-black italic leading-none"
      style={{
        fontSize: size,
        gap: "0.28em",
        padding: "0.2em 0.55em 0.15em",
        transform: "skewX(-12deg)",
        border: framed ? "2px solid var(--color-fg)" : undefined,
        outline: framed ? "2px solid var(--color-ink)" : undefined,
      }}
    >
      <span className="text-lime">10</span>
      <span className="text-fg">E FAIXA</span>
    </span>
  );
}
