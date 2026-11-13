/** Assinatura "10 E FAIXA" (vetorizada do logo oficial). `size` é a altura aproximada da letra, como antes. */
export function Wordmark({ size = 26 }: { size?: number }) {
  // A arte tem proporção 1192 x 241; a altura da caixa é ~1,6x a altura da letra.
  const height = Math.round(size * 1.6);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-10efaixa.svg"
      alt="10 e FAIXA"
      width={Math.round((height * 1192) / 241)}
      height={height}
      className="block shrink-0 select-none"
      draggable={false}
    />
  );
}
