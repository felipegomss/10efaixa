import { formatPhoneBR } from "@/lib/settings";
import { Wordmark } from "./Wordmark";

const TICKER = ["Pra quem é do jogo", "Camisas", "Chuteiras", "Bolas", "Acessórios", "A casa do boleiro"];

export function Footer({
  categories,
  whatsapp,
  instagram,
  onPickCategory,
}: {
  categories: string[];
  whatsapp: string;
  instagram: string;
  onPickCategory: (c: string) => void;
}) {
  const year = new Date().getFullYear();
  const ticker = (
    <span className="flex shrink-0 items-center">
      {TICKER.map((t) => (
        <span key={t} className="flex items-center">
          <span className="px-5">{t}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="currentColor" />
          </svg>
        </span>
      ))}
    </span>
  );

  return (
    <footer className="relative mt-10 overflow-hidden">
      {/* Faixa de capitão em movimento */}
      <div className="relative z-[2] -mx-4 -rotate-[1.5deg] border-y-2 border-ink bg-lime py-3 text-ink">
        <div
          className="tf-marquee flex w-max font-display text-[22px] leading-none font-black tracking-[1px] whitespace-nowrap uppercase italic sm:text-[26px]"
          aria-hidden="true"
        >
          {ticker}
          {ticker}
          {ticker}
          {ticker}
        </div>
        <p className="sr-only">Pra quem é do jogo: camisas, chuteiras, bolas e acessórios.</p>
      </div>

      <div className="relative z-[1] bg-[#070808] pt-16">
        {/* Linhas do campo ao fundo */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-[-300px] h-full w-[760px] text-[#161A18] max-md:right-[-440px]"
          viewBox="0 0 760 640"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          preserveAspectRatio="xMidYMid slice"
        >
          <line x1="380" y1="-10" x2="380" y2="650" />
          <circle cx="380" cy="320" r="150" />
          <circle cx="380" cy="320" r="6" fill="currentColor" />
          <rect x="680" y="160" width="120" height="320" />
          <rect x="-40" y="160" width="120" height="320" />
        </svg>

        <div className="relative mx-auto grid max-w-[1240px] gap-12 px-4 sm:px-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="flex flex-col items-start gap-6">
            <p className="text-[13px] font-bold tracking-[2px] text-lime uppercase">Fechou o time?</p>
            <h2 className="font-display text-[clamp(48px,7vw,92px)] leading-[0.88] font-black tracking-[-1px] uppercase italic">
              Bora montar
              <br />
              seu <span className="text-lime">pedido?</span>
            </h2>
            <p className="max-w-[460px] text-[17px] leading-normal text-muted">
              Escolhe no catálogo, manda pelo WhatsApp e a gente combina valores, tamanho e entrega com você.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[54px] items-center gap-2.5 rounded-xl bg-lime px-6 text-base font-extrabold text-ink transition-transform hover:-translate-y-0.5"
              >
                <WhatsIcon />
                Chamar no WhatsApp
              </a>
              {instagram && (
                <a
                  href={`https://instagram.com/${instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[54px] items-center gap-2.5 rounded-xl border border-line-2 px-6 text-base font-bold text-fg transition-colors hover:border-lime hover:text-lime"
                >
                  <InstaIcon />@{instagram}
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            <FooterCol title="Categorias">
              {categories.map((c) => (
                <li key={c}>
                  <button onClick={() => onPickCategory(c)} className="cursor-pointer text-left text-fg-2 transition-colors hover:text-lime">
                    {c}
                  </button>
                </li>
              ))}
              <li>
                <button onClick={() => onPickCategory("Todos")} className="cursor-pointer text-left text-lime">
                  Ver tudo →
                </button>
              </li>
            </FooterCol>
            <FooterCol title="Como comprar">
              {["Escolha os itens", "Monte seu pedido", "Envie no WhatsApp", "Combine a entrega"].map((t, i) => (
                <li key={t} className="flex items-baseline gap-2 text-fg-2">
                  <span className="font-display text-sm font-black text-lime italic">0{i + 1}</span>
                  {t}
                </li>
              ))}
            </FooterCol>
            <FooterCol title="A loja">
              <li className="text-fg-2">Jacobina - BA</li>
              <li className="text-fg-2">Loja on-line</li>
              <li>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-fg-2 transition-colors hover:text-lime">
                  {formatPhoneBR(whatsapp)}
                </a>
              </li>
            </FooterCol>
          </div>
        </div>

        {/* Assinatura gigante */}
        <div className="relative mx-auto mt-16 max-w-[1240px] px-4 sm:px-8" aria-hidden="true">
          <svg viewBox="0 0 1000 118" className="block w-full overflow-visible select-none">
            <text
              x="2"
              y="104"
              textLength="996"
              lengthAdjust="spacingAndGlyphs"
              fill="none"
              stroke="#2C322E"
              strokeWidth="1.2"
              fontFamily="'Barlow Condensed', sans-serif"
              fontWeight="900"
              fontStyle="italic"
              fontSize="132"
            >
              A CASA DO BOLEIRO
            </text>
          </svg>
        </div>

        <div className="relative mt-8 border-t border-line">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-4 px-4 py-6 text-[13px] text-dim sm:px-8">
            <Wordmark size={16} />
            <span>© {year} 10 e FAIXA · Jacobina - BA</span>
            <div className="grow" />
            <a href="/admin" className="transition-colors hover:text-fg">
              Área do lojista
            </a>
            <a href="#topo" className="flex h-10 items-center gap-2 rounded-full border border-line-2 px-4 font-semibold text-fg-2 transition-colors hover:border-lime hover:text-lime">
              Voltar ao topo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 19V5M6 11l6-6 6 6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 font-display text-lg font-extrabold tracking-[1.5px] text-fg uppercase italic">{title}</h3>
      <ul className="flex flex-col gap-2.5 text-[15px]">{children}</ul>
    </div>
  );
}

function WhatsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2z" />
    </svg>
  );
}

function InstaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
