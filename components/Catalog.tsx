"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductMedia, mediaCount, mediaLabel } from "./ProductMedia";
import { Footer } from "./Footer";
import { Wordmark } from "./Wordmark";

type CartItem = { key: string; id: number; size: string; qty: number };
const CART_KEY = "10efaixa:pedido";
const ONE_SIZE = "Único";

function sizesOf(p: Product) {
  return p.sizes.length > 0 ? p.sizes : [ONE_SIZE];
}

export function Catalog({
  categories,
  products,
  whatsapp,
  instagram,
}: {
  categories: string[];
  products: Product[];
  whatsapp: string;
  instagram: string;
}) {
  const [cat, setCat] = useState("Todos");
  const [q, setQ] = useState("");
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [photo, setPhoto] = useState<Record<number, number>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [lb, setLb] = useState<{ id: number; idx: number } | null>(null);
  const [name, setName] = useState("");
  const [added, setAdded] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Pedido salvo no aparelho, para não perder ao recarregar a página.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      if (Array.isArray(saved.cart)) setCart(saved.cart.filter((c: CartItem) => byId.has(c.id)));
      if (typeof saved.name === "string") setName(saved.name);
    } catch {}
    setLoaded(true);
  }, [byId]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify({ cart, name }));
    } catch {}
  }, [cart, name, loaded]);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(null), 1400);
    return () => clearTimeout(t);
  }, [added]);

  const overlayOpen = cartOpen || lb !== null;
  useEffect(() => {
    if (!overlayOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLb(null);
        setCartOpen(false);
      }
      if (lb) {
        const n = mediaCount(byId.get(lb.id)!);
        if (e.key === "ArrowRight") setLb({ id: lb.id, idx: (lb.idx + 1) % n });
        if (e.key === "ArrowLeft") setLb({ id: lb.id, idx: (lb.idx - 1 + n) % n });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [overlayOpen, lb, byId]);

  const query = q.trim().toLowerCase();
  const list = products.filter((p) => {
    if (cat !== "Todos" && p.category !== cat) return false;
    if (onlyAvail && !p.available) return false;
    if (query && !`${p.name} ${p.category} ${p.subtype}`.toLowerCase().includes(query)) return false;
    return true;
  });

  const cartLines = cart.flatMap((c) => {
    const p = byId.get(c.id);
    return p ? [{ ...c, product: p }] : [];
  });
  const count = cartLines.reduce((a, c) => a + c.qty, 0);
  const trimmedName = name.trim();
  const msg =
    "Olá, 10 e FAIXA! Montei meu pedido pelo catálogo:\n\n" +
    cartLines.map((c) => `• ${c.qty}x ${c.product.name}${c.size === ONE_SIZE ? "" : ` — Tam. ${c.size}`}`).join("\n") +
    "\n\n" +
    (trimmedName ? `Nome: ${trimmedName}\n` : "") +
    "Pode me passar valores e disponibilidade?";
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;

  function addToCart(p: Product, size: string) {
    const key = `${p.id}|${size}`;
    setCart((prev) =>
      prev.some((c) => c.key === key)
        ? prev.map((c) => (c.key === key ? { ...c, qty: c.qty + 1 } : c))
        : [...prev, { key, id: p.id, size, qty: 1 }],
    );
    setAdded(p.id);
  }

  function changeQty(key: string, d: number) {
    setCart((prev) => prev.map((c) => (c.key === key ? { ...c, qty: c.qty + d } : c)).filter((c) => c.qty > 0));
  }

  function movePhoto(p: Product, d: number) {
    const n = mediaCount(p);
    setPhoto((prev) => ({ ...prev, [p.id]: ((prev[p.id] ?? 0) + d + n) % n }));
  }

  const lbProduct = lb ? byId.get(lb.id) : undefined;
  const pill = (on: boolean) =>
    on ? "border-lime bg-lime text-ink" : "border-line-2 bg-transparent text-fg-2 hover:border-dim";

  return (
    <div id="topo" className="min-h-screen bg-ink text-[15px] text-fg">
      <header className="sticky top-0 z-20 border-b border-line bg-ink">
        <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-4 py-3 sm:px-8">
          <a href="#topo" aria-label="10 e FAIXA — início" className="flex shrink-0 items-center px-1.5 py-1">
            <span className="sm:hidden">
              <Wordmark size={21} />
            </span>
            <span className="hidden sm:inline">
              <Wordmark size={26} />
            </span>
          </a>
          <span className="hidden flex-col justify-center gap-[3px] border-l border-line-2 pl-3.5 leading-none whitespace-nowrap md:flex">
            <span className="font-display text-[17px] font-bold tracking-[2.5px] text-fg-2 uppercase italic">A casa do boleiro</span>
            <span className="text-xs font-medium tracking-[0.4px] text-dim">Jacobina - BA</span>
          </span>
          <div className="grow" />
          <button
            onClick={() => setCartOpen(true)}
            className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-full bg-lime py-0 pr-2 pl-4 text-[15px] font-bold text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 7h12l-1 13H7L6 7z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            <span>
              <span className="hidden sm:inline">Meu pedido</span>
              <span className="sm:hidden">Pedido</span>
            </span>
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-ink px-1.5 text-sm text-lime" aria-label={`${count} itens`}>
              {count}
            </span>
          </button>
        </div>
      </header>

      <section className="mx-auto flex max-w-[1240px] flex-wrap items-end gap-x-12 gap-y-6 px-4 pt-10 pb-6 sm:px-8">
        <div className="min-w-0 flex-[1_1_420px]">
          <p className="mb-3 text-[13px] font-bold tracking-[2px] text-lime uppercase">Catálogo on-line</p>
          <h1 className="font-display text-[clamp(44px,6vw,80px)] leading-[0.92] font-extrabold tracking-[-1px] uppercase">
            Seu próximo jogo
            <br />
            começa <span className="text-lime italic">aqui.</span>
          </h1>
          <p className="mt-4 max-w-[520px] text-[17px] leading-normal text-muted">
            Camisas, chuteiras e material esportivo. Monte seu pedido e finalize direto no WhatsApp da loja — sem cadastro.
          </p>
        </div>
        <ol className="flex flex-[1_1_300px] flex-col gap-2.5">
          {["Escolha os itens e o tamanho", "Confira tudo em “Meu pedido”", "Envie pelo WhatsApp e combine com a loja"].map((t, i) => (
            <li key={t} className="flex items-center gap-3 text-fg-2">
              <span
                className={`inline-flex size-[30px] shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  i === 2 ? "bg-lime text-ink" : "border border-lime text-lime"
                }`}
              >
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Filtros" className="sticky top-[69px] z-10 border-b border-[#1C201E] bg-ink">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-3 px-4 py-3.5 sm:px-8">
          <div className="flex h-11 min-w-0 flex-[1_1_260px] items-center gap-2 rounded-full border border-line-2 bg-panel px-3.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9AA29C" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <label htmlFor="busca" className="sr-only">
              Buscar produto
            </label>
            <input
              id="busca"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar: Bahia, Mercurial, bola…"
              className="h-10 min-w-0 grow bg-transparent text-[15px] text-fg outline-none placeholder:text-dim"
            />
          </div>
          <div role="group" aria-label="Categorias" className="no-scrollbar flex max-w-full gap-2 overflow-x-auto max-sm:flex-nowrap sm:flex-wrap">
            {["Todos", ...categories].map((c) => {
              const n = c === "Todos" ? products.length : products.filter((p) => p.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  aria-pressed={cat === c}
                  className={`h-10 shrink-0 cursor-pointer rounded-full border px-4 text-sm font-semibold whitespace-nowrap ${pill(cat === c)}`}
                >
                  {c} <span className="font-medium opacity-70">{n}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setOnlyAvail((v) => !v)}
            aria-pressed={onlyAvail}
            className="flex h-11 cursor-pointer items-center gap-2.5 px-1 text-sm font-semibold text-fg-2"
          >
            <span className={`relative inline-block h-6 w-10 rounded-full transition-colors ${onlyAvail ? "bg-lime" : "bg-[#3A413C]"}`}>
              <span className={`absolute top-[3px] size-[18px] rounded-full bg-ink transition-[left] ${onlyAvail ? "left-[19px]" : "left-[3px]"}`} />
            </span>
            Só disponíveis
          </button>
        </div>
      </section>

      <main id="produtos" className="mx-auto max-w-[1240px] scroll-mt-[140px] px-4 pt-5 pb-14 sm:px-8">
        <p className="mb-4 text-sm text-dim">{list.length === 1 ? "1 produto" : `${list.length} produtos`}</p>
        {list.length === 0 && (
          <div className="rounded-[14px] border border-dashed border-line-2 px-6 py-14 text-center text-muted">
            <p className="mb-3 text-[17px]">Nenhum produto encontrado com esses filtros.</p>
            <button
              onClick={() => {
                setCat("Todos");
                setQ("");
                setOnlyAvail(false);
              }}
              className="h-11 cursor-pointer rounded-full border border-lime px-5 text-sm font-bold text-lime"
            >
              Limpar filtros
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] sm:gap-5">
          {list.map((p, pi) => {
            const n = mediaCount(p);
            const idx = (photo[p.id] ?? 0) % n;
            const sizes = sizesOf(p);
            const one = sizes.length === 1;
            const pick = one ? sizes[0] : picks[p.id];
            const soldOut = !p.available;
            const ready = !soldOut && !!pick;
            const justAdded = added === p.id;
            const label = soldOut ? "Esgotado" : justAdded ? "Adicionado ✓" : pick ? "Adicionar ao pedido" : "Escolha o tamanho";
            return (
              <article key={p.id} className="flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-line bg-panel">
                <div className="relative">
                  <button
                    onClick={() => setLb({ id: p.id, idx })}
                    aria-label={`Ampliar fotos de ${p.name}`}
                    className={`block w-full cursor-zoom-in ${soldOut ? "opacity-45" : ""}`}
                  >
                    <ProductMedia product={p} index={idx} eager={pi < 4} />
                  </button>
                  <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-md bg-ink/80 px-2 py-1 text-xs font-semibold">
                    {mediaLabel(p, idx)}
                  </span>
                  {soldOut && (
                    <span className="pointer-events-none absolute top-2.5 right-2.5 rounded-md bg-fg px-2.5 py-1 text-xs font-extrabold tracking-[1px] text-ink uppercase">
                      Esgotado
                    </span>
                  )}
                  {n > 1 && (
                    <>
                      <button
                        onClick={() => movePhoto(p, -1)}
                        aria-label="Foto anterior"
                        className="absolute top-1/2 left-1.5 -mt-[22px] flex size-11 cursor-pointer items-center justify-center rounded-full bg-ink/70 text-fg"
                      >
                        <Chevron dir="left" />
                      </button>
                      <button
                        onClick={() => movePhoto(p, 1)}
                        aria-label="Próxima foto"
                        className="absolute top-1/2 right-1.5 -mt-[22px] flex size-11 cursor-pointer items-center justify-center rounded-full bg-ink/70 text-fg"
                      >
                        <Chevron dir="right" />
                      </button>
                      <div className="absolute right-0 bottom-1 left-0 flex justify-center">
                        {Array.from({ length: n }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setPhoto((prev) => ({ ...prev, [p.id]: i }))}
                            aria-label={`Ver foto ${i + 1}`}
                            className="cursor-pointer px-[3px] py-2"
                          >
                            <span
                              className={`block h-1.5 rounded-full transition-[width] ${i === idx ? "w-[18px] bg-lime" : "w-1.5 bg-fg/55"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex grow flex-col gap-2.5 px-3.5 pt-3.5 pb-4">
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-[1.2px] text-lime uppercase">
                      {p.category}
                      {p.subtype ? ` · ${p.subtype}` : ""}
                    </p>
                    <h3 className="text-sm leading-snug font-semibold sm:text-base">{p.name}</h3>
                  </div>
                  {one ? (
                    <p className="text-[13px] text-dim">{sizes[0] === ONE_SIZE ? "Tamanho único" : `Tamanho ${sizes[0]}`}</p>
                  ) : (
                    <div role="group" aria-label="Tamanho" className="flex flex-wrap gap-1.5">
                      {sizes.map((sz) => (
                        <button
                          key={sz}
                          disabled={soldOut}
                          onClick={() => setPicks((prev) => ({ ...prev, [p.id]: sz }))}
                          aria-pressed={pick === sz}
                          className={`h-9 min-w-10 cursor-pointer rounded-lg border px-2 text-sm font-semibold disabled:cursor-not-allowed ${
                            pick === sz ? "border-fg bg-fg text-ink" : soldOut ? "border-line-2 text-[#5F6661]" : "border-line-2 text-fg-2 hover:border-dim"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="grow" />
                  <button
                    disabled={!ready}
                    onClick={() => ready && addToCart(p, pick!)}
                    className={`h-[46px] rounded-[10px] border text-[15px] font-bold ${
                      ready
                        ? `cursor-pointer border-transparent text-ink ${justAdded ? "bg-fg" : "bg-lime"}`
                        : `cursor-not-allowed border-line-2 ${soldOut ? "text-[#5F6661]" : "text-muted"}`
                    }`}
                  >
                    {label}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <Footer
        categories={categories}
        whatsapp={whatsapp}
        instagram={instagram}
        onPickCategory={(c) => {
          setCat(c);
          setQ("");
          document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setCartOpen(false)}>
          <aside
            aria-label="Meu pedido"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-[440px] max-w-full flex-col border-l border-line bg-panel-2"
          >
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <h2 className="grow font-display text-[28px] font-extrabold uppercase">Meu pedido</h2>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Fechar pedido"
                className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-line-2"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex grow flex-col gap-3 overflow-y-auto px-5 py-4">
              {cartLines.length === 0 ? (
                <div className="px-2 py-10 text-center text-muted">
                  <p className="mb-1.5 text-[17px] font-semibold text-fg">Seu pedido está vazio</p>
                  <p className="mb-4 text-sm">Escolha os produtos no catálogo e eles aparecem aqui.</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="h-11 cursor-pointer rounded-full border border-lime px-5 text-sm font-bold text-lime"
                  >
                    Ver catálogo
                  </button>
                </div>
              ) : (
                <>
                  {cartLines.map((c) => (
                    <div key={c.key} className="flex items-center gap-3 rounded-xl border border-line bg-panel p-2.5">
                      <div className="w-16 shrink-0 overflow-hidden rounded-lg">
                        <ProductMedia product={c.product} index={0} />
                      </div>
                      <div className="min-w-0 grow">
                        <p className="text-sm leading-snug font-semibold">{c.product.name}</p>
                        <p className="mt-0.5 mb-2 text-[13px] text-dim">Tamanho: {c.size}</p>
                        {!c.product.available && <p className="mb-2 text-[13px] text-[#F5A524]">Esgotou desde que você adicionou</p>}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => changeQty(c.key, -1)}
                            aria-label="Diminuir quantidade"
                            className="size-9 cursor-pointer rounded-lg border border-line-2 text-lg"
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center font-bold">{c.qty}</span>
                          <button
                            onClick={() => changeQty(c.key, 1)}
                            aria-label="Aumentar quantidade"
                            className="size-9 cursor-pointer rounded-lg border border-line-2 text-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => changeQty(c.key, -c.qty)}
                        aria-label={`Remover ${c.product.name}`}
                        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-dim hover:text-fg"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                  <div className="mt-2 flex flex-col gap-1.5">
                    <label htmlFor="nome" className="text-[13px] font-semibold text-muted">
                      Seu nome (opcional)
                    </label>
                    <input
                      id="nome"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Como a loja te chama?"
                      className="h-11 rounded-[10px] border border-line-2 bg-panel px-3.5 text-[15px] outline-none placeholder:text-dim"
                    />
                  </div>
                  <div className="mt-2 rounded-xl border border-line bg-ink px-3.5 py-3">
                    <p className="mb-1.5 text-xs font-bold tracking-[1px] text-dim uppercase">Prévia da mensagem</p>
                    <p className="text-[13px] leading-normal whitespace-pre-line text-fg-2">{msg}</p>
                  </div>
                </>
              )}
            </div>
            {cartLines.length > 0 && (
              <div className="flex flex-col gap-2.5 border-t border-line px-5 pt-4 pb-5">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[52px] items-center justify-center gap-2.5 rounded-xl bg-lime text-base font-extrabold text-ink"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" />
                    <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2z" />
                  </svg>
                  Enviar pedido no WhatsApp
                </a>
                <p className="text-center text-[13px] text-dim">
                  {count} {count === 1 ? "item" : "itens"} · valores e entrega combinados com a loja
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      {lb && lbProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${lbProduct.name}`}
          onClick={() => setLb(null)}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-[#050605]/95 p-4"
        >
          <button
            onClick={() => setLb(null)}
            aria-label="Fechar fotos"
            className="absolute top-4 right-4 flex size-11 cursor-pointer items-center justify-center rounded-full border border-line-2 bg-panel-2"
          >
            <CloseIcon />
          </button>
          <p className="max-w-[560px] text-center text-base font-semibold" onClick={(e) => e.stopPropagation()}>
            {lbProduct.name} <span className="font-medium text-dim">· {mediaLabel(lbProduct, lb.idx)}</span>
          </p>
          <div className="flex w-full items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
            {mediaCount(lbProduct) > 1 && (
              <button
                onClick={() => setLb({ id: lb.id, idx: (lb.idx - 1 + mediaCount(lbProduct)) % mediaCount(lbProduct) })}
                aria-label="Foto anterior"
                className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-2 bg-panel-2 max-sm:hidden"
              >
                <Chevron dir="left" />
              </button>
            )}
            <div className="w-[min(560px,70vh,100%)] overflow-hidden rounded-2xl">
              <ProductMedia product={lbProduct} index={lb.idx} eager />
            </div>
            {mediaCount(lbProduct) > 1 && (
              <button
                onClick={() => setLb({ id: lb.id, idx: (lb.idx + 1) % mediaCount(lbProduct) })}
                aria-label="Próxima foto"
                className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-2 bg-panel-2 max-sm:hidden"
              >
                <Chevron dir="right" />
              </button>
            )}
          </div>
          {mediaCount(lbProduct) > 1 && (
            <div className="flex flex-wrap justify-center gap-2.5" onClick={(e) => e.stopPropagation()}>
              {Array.from({ length: mediaCount(lbProduct) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setLb({ id: lb.id, idx: i })}
                  aria-label={`Ver ${mediaLabel(lbProduct, i)}`}
                  className={`w-16 cursor-pointer overflow-hidden rounded-[10px] border-2 ${i === lb.idx ? "border-lime" : "border-transparent"}`}
                >
                  <ProductMedia product={lbProduct} index={i} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}
