"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  addCategory,
  discardPhotos,
  editCategory,
  logout,
  removeCategory,
  removeProduct,
  saveProduct,
  toggleAvailability,
  type ActionResult,
} from "@/app/admin/actions";
import type { Category, Product } from "@/lib/types";
import { CloseIcon, TrashIcon } from "./Catalog";
import { ProductMedia } from "./ProductMedia";
import { Wordmark } from "./Wordmark";

type Draft = {
  id: number | null;
  name: string;
  categoryId: number | null;
  subtype: string;
  sizes: string;
  available: boolean;
  photos: string[];
};

const EMPTY: Draft = { id: null, name: "", categoryId: null, subtype: "", sizes: "", available: true, photos: [] };

export function AdminPanel({ categories, products, hasDb, hasBlob }: { categories: Category[]; products: Product[]; hasDb: boolean; hasBlob: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"Todos" | "Disponíveis" | "Esgotados">("Todos");
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>({ ...EMPTY, categoryId: categories[0]?.id ?? null });
  const [uploadedNow, setUploadedNow] = useState<string[]>([]);
  const [uploading, setUploading] = useState(0);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [editingCat, setEditingCat] = useState<{ id: number; name: string } | null>(null);
  // Mudança otimista de disponibilidade enquanto o servidor confirma.
  const [availOverride, setAvailOverride] = useState<Record<number, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLElement>(null);

  function notify(text: string, error = false) {
    setToast({ text, error });
    setTimeout(() => setToast(null), 3200);
  }

  function act(p: Promise<ActionResult>, okText?: string, after?: () => void) {
    startTransition(async () => {
      const r = await p;
      if (!r.ok) notify(r.error, true);
      else {
        if (okText) notify(okText);
        after?.();
        router.refresh();
      }
    });
  }

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products
      .map((p) => ({ ...p, available: availOverride[p.id] ?? p.available }))
      .filter((p) => {
        if (tab === "Disponíveis" && !p.available) return false;
        if (tab === "Esgotados" && p.available) return false;
        if (catFilter !== null && p.categoryId !== catFilter) return false;
        if (query && !`${p.name} ${p.category} ${p.subtype}`.toLowerCase().includes(query)) return false;
        return true;
      });
  }, [products, q, tab, catFilter, availOverride]);

  const availCount = products.filter((p) => availOverride[p.id] ?? p.available).length;
  const editing = draft.id !== null;
  const canSave = draft.name.trim().length > 1 && draft.categoryId !== null && uploading === 0 && hasDb;

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!hasBlob) {
      notify("Armazenamento de fotos ainda não configurado (Vercel Blob).", true);
      return;
    }
    const room = 8 - draft.photos.length;
    const chosen = Array.from(files).slice(0, Math.max(0, room));
    if (chosen.length < files.length) notify("Máximo de 8 fotos por produto.", true);
    setUploading((n) => n + chosen.length);
    await Promise.all(
      chosen.map(async (file) => {
        try {
          const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
          const blob = await upload(`produtos/${safe}`, file, { access: "public", handleUploadUrl: "/api/upload" });
          setDraft((d) => ({ ...d, photos: [...d.photos, blob.url] }));
          setUploadedNow((u) => [...u, blob.url]);
        } catch (e) {
          console.error(e);
          notify(`Não foi possível enviar ${file.name}.`, true);
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(url: string) {
    setDraft((d) => ({ ...d, photos: d.photos.filter((u) => u !== url) }));
    // Só apaga do armazenamento na hora se foi enviada agora e nunca foi salva.
    if (uploadedNow.includes(url)) {
      setUploadedNow((u) => u.filter((x) => x !== url));
      void discardPhotos([url]);
    }
  }

  function makeCover(url: string) {
    setDraft((d) => ({ ...d, photos: [url, ...d.photos.filter((u) => u !== url)] }));
  }

  function resetForm() {
    if (uploadedNow.length) void discardPhotos(uploadedNow);
    setUploadedNow([]);
    setDraft({ ...EMPTY, categoryId: draft.categoryId ?? categories[0]?.id ?? null });
  }

  function startEdit(p: Product) {
    if (uploadedNow.length) void discardPhotos(uploadedNow);
    setUploadedNow([]);
    setDraft({
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      subtype: p.subtype,
      sizes: p.sizes.join(", "),
      available: availOverride[p.id] ?? p.available,
      photos: p.photos,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function submit() {
    if (!canSave) return;
    const input = {
      name: draft.name,
      categoryId: draft.categoryId!,
      subtype: draft.subtype,
      sizes: draft.sizes.split(","),
      available: draft.available,
      photos: draft.photos,
    };
    act(saveProduct(draft.id, input), editing ? "Produto atualizado ✓" : "Produto adicionado ao catálogo ✓", () => {
      // Fotos removidas na edição de um produto já salvo: apaga agora que a mudança foi gravada.
      if (draft.id !== null) {
        const before = products.find((p) => p.id === draft.id)?.photos ?? [];
        const gone = before.filter((u) => !draft.photos.includes(u));
        if (gone.length) void discardPhotos(gone);
      }
      setUploadedNow([]);
      setDraft({ ...EMPTY, categoryId: draft.categoryId });
    });
  }

  function createCat() {
    const name = newCat.trim();
    if (name.length < 2) return;
    startTransition(async () => {
      const r = await addCategory(name);
      if (!r.ok) return notify(r.error, true);
      setDraft((d) => ({ ...d, categoryId: r.id }));
      setNewCat("");
      setNewCatOpen(false);
      notify(`Categoria “${name}” pronta ✓`);
      router.refresh();
    });
  }

  const pill = (on: boolean) => (on ? "border-lime bg-lime text-ink" : "border-line-2 bg-transparent text-fg-2 hover:border-dim");
  const input = "h-11 rounded-[10px] border border-line-2 bg-ink px-3.5 text-[15px] text-fg outline-none placeholder:text-dim focus:border-lime";

  return (
    <div className="min-h-screen bg-ink text-[15px] text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:px-8">
          <Wordmark size={24} />
          <span className="border-l border-line-2 pl-3.5 text-sm text-dim">Painel do lojista</span>
          <div className="grow" />
          <a href="/" target="_blank" className="inline-flex h-11 items-center gap-2 rounded-full border border-line-2 px-4 text-sm font-semibold hover:border-dim">
            Ver catálogo ↗
          </a>
          <form action={logout}>
            <button type="submit" className="h-11 cursor-pointer px-3 text-sm text-dim hover:text-fg">
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 pt-7 pb-14 sm:px-8">
        {!hasDb && (
          <p className="rounded-xl border border-[#F5A524]/50 bg-[#F5A524]/10 p-4 text-sm text-[#F5D38A]">
            Banco de dados não conectado: você está vendo os produtos de exemplo e nada será salvo. Conecte um banco Postgres (Neon) ao projeto na Vercel.
          </p>
        )}
        <div className="flex flex-wrap items-end gap-4">
          <h1 className="grow font-display text-[44px] leading-none font-extrabold uppercase">Estoque</h1>
          <div className="flex flex-wrap gap-2.5">
            <Stat label="Produtos" value={products.length} />
            <Stat label="Disponíveis" value={availCount} accent />
            <Stat label="Esgotados" value={products.length - availCount} />
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-6">
          <section
            ref={formRef}
            aria-label={editing ? "Editar produto" : "Novo produto"}
            className="flex min-w-0 flex-[1_1_320px] scroll-mt-4 flex-col gap-3.5 rounded-2xl border border-line bg-panel p-5 lg:sticky lg:top-4"
          >
            <div className="flex items-center gap-2">
              <h2 className="grow font-display text-[26px] font-extrabold uppercase">{editing ? "Editar produto" : "Novo produto"}</h2>
              {editing && (
                <button onClick={resetForm} className="h-9 cursor-pointer rounded-full border border-line-2 px-3 text-[13px] text-muted hover:text-fg">
                  Cancelar edição
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="fnome" className="text-[13px] font-semibold text-muted">
                Nome do produto
              </label>
              <input
                id="fnome"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Ex.: Camisa Bahia II 24/25"
                className={input}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span id="fcatlbl" className="text-[13px] font-semibold text-muted">
                Categoria
              </span>
              <div role="group" aria-labelledby="fcatlbl" className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setDraft({ ...draft, categoryId: c.id })}
                    aria-pressed={draft.categoryId === c.id}
                    className={`h-[38px] cursor-pointer rounded-full border px-3.5 text-sm font-semibold ${pill(draft.categoryId === c.id)}`}
                  >
                    {c.name}
                  </button>
                ))}
                {!newCatOpen && (
                  <button
                    onClick={() => setNewCatOpen(true)}
                    disabled={!hasDb}
                    className="h-[38px] cursor-pointer rounded-full border border-dashed border-lime px-3.5 text-sm font-bold text-lime disabled:opacity-50"
                  >
                    + Nova categoria
                  </button>
                )}
              </div>
              {newCatOpen && (
                <div className="mt-1 flex items-center gap-1.5">
                  <label htmlFor="fnewcat" className="sr-only">
                    Nome da nova categoria
                  </label>
                  <input
                    id="fnewcat"
                    autoFocus
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createCat()}
                    placeholder="Ex.: Luvas, Agasalhos"
                    className={`${input} h-10 min-w-0 grow border-lime`}
                  />
                  <button
                    onClick={createCat}
                    disabled={newCat.trim().length < 2 || pending}
                    className="h-10 cursor-pointer rounded-[10px] bg-lime px-3.5 text-sm font-bold text-ink disabled:bg-line disabled:text-dim"
                  >
                    Criar
                  </button>
                  <button
                    onClick={() => {
                      setNewCatOpen(false);
                      setNewCat("");
                    }}
                    aria-label="Cancelar nova categoria"
                    className="flex size-10 cursor-pointer items-center justify-center rounded-[10px] border border-line-2 text-dim"
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="fsub" className="text-[13px] font-semibold text-muted">
                Tipo (opcional)
              </label>
              <input
                id="fsub"
                value={draft.subtype}
                onChange={(e) => setDraft({ ...draft, subtype: e.target.value })}
                placeholder="Ex.: Society, Campo, Torcedor"
                className={input}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="fsizes" className="text-[13px] font-semibold text-muted">
                Tamanhos (separe por vírgula)
              </label>
              <input
                id="fsizes"
                value={draft.sizes}
                onChange={(e) => setDraft({ ...draft, sizes: e.target.value })}
                placeholder="P, M, G, GG  ou  38, 39, 40"
                className={input}
              />
              <span className="text-xs text-dim">Deixe vazio para tamanho único.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-muted">Fotos {draft.photos.length > 0 && `(${draft.photos.length}/8)`}</span>
              {draft.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {draft.photos.map((url, i) => (
                    <div key={url} className="group relative overflow-hidden rounded-lg border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Foto ${i + 1}`} className="aspect-square w-full object-cover" />
                      {i === 0 ? (
                        <span className="absolute bottom-1 left-1 rounded bg-lime px-1.5 text-[11px] font-bold text-ink">Capa</span>
                      ) : (
                        <button
                          onClick={() => makeCover(url)}
                          className="absolute bottom-1 left-1 cursor-pointer rounded bg-ink/85 px-1.5 text-[11px] font-semibold text-fg"
                        >
                          Usar como capa
                        </button>
                      )}
                      <button
                        onClick={() => removePhoto(url)}
                        aria-label={`Remover foto ${i + 1}`}
                        className="absolute top-1 right-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-ink/85 text-fg"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={fileRef}
                id="ffotos"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => onFiles(e.target.files)}
              />
              <label
                htmlFor="ffotos"
                className="flex h-[96px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#3A413C] bg-ink text-sm text-muted hover:border-lime"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C6F41F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="9" cy="10" r="2" />
                  <path d="M21 16l-5-5-8 8" />
                </svg>
                {uploading > 0 ? `Enviando ${uploading} foto(s)…` : "Toque para escolher fotos"}
                <span className="text-xs text-dim">A primeira vira a capa do produto</span>
              </label>
            </div>

            <button
              onClick={() => setDraft({ ...draft, available: !draft.available })}
              aria-pressed={draft.available}
              className="flex h-11 cursor-pointer items-center gap-2.5 text-sm font-semibold text-fg-2"
            >
              <Switch on={draft.available} />
              Disponível na loja
            </button>

            <button
              onClick={submit}
              disabled={!canSave || pending}
              className="h-12 cursor-pointer rounded-xl bg-lime text-[15px] font-extrabold text-ink disabled:cursor-not-allowed disabled:bg-line disabled:text-dim"
            >
              {pending ? "Salvando…" : editing ? "Salvar alterações" : "Adicionar ao catálogo"}
            </button>
          </section>

          <section aria-label="Produtos cadastrados" className="flex min-w-0 flex-[999_1_560px] flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex h-11 min-w-0 flex-[1_1_220px] items-center gap-2 rounded-full border border-line-2 bg-panel px-3.5">
                <label htmlFor="abusca" className="sr-only">
                  Buscar no estoque
                </label>
                <input
                  id="abusca"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar no estoque"
                  className="h-10 min-w-0 grow bg-transparent text-[15px] outline-none placeholder:text-dim"
                />
              </div>
              <div role="group" aria-label="Filtrar por estoque" className="flex flex-wrap gap-1.5">
                {(["Todos", "Disponíveis", "Esgotados"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t} className={`h-10 cursor-pointer rounded-full border px-3.5 text-sm font-semibold ${pill(tab === t)}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div role="group" aria-label="Categorias" className="flex flex-wrap items-center gap-1.5">
              <button onClick={() => setCatFilter(null)} aria-pressed={catFilter === null} className={`h-9 cursor-pointer rounded-full border px-3 text-[13px] font-semibold ${pill(catFilter === null)}`}>
                Todas
              </button>
              {categories.map((c) =>
                editingCat?.id === c.id ? (
                  <span key={c.id} className="flex items-center gap-1">
                    <label htmlFor={`cat-${c.id}`} className="sr-only">
                      Novo nome da categoria
                    </label>
                    <input
                      id={`cat-${c.id}`}
                      autoFocus
                      value={editingCat.name}
                      onChange={(e) => setEditingCat({ id: c.id, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") act(editCategory(c.id, editingCat.name), "Categoria renomeada ✓", () => setEditingCat(null));
                        if (e.key === "Escape") setEditingCat(null);
                      }}
                      className="h-9 w-36 rounded-full border border-lime bg-ink px-3 text-[13px] outline-none"
                    />
                    <button
                      onClick={() => act(editCategory(c.id, editingCat.name), "Categoria renomeada ✓", () => setEditingCat(null))}
                      className="h-9 cursor-pointer rounded-full bg-lime px-3 text-[13px] font-bold text-ink"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir a categoria “${c.name}”? Só funciona se ela estiver vazia.`)) act(removeCategory(c.id), "Categoria excluída", () => setEditingCat(null));
                      }}
                      aria-label={`Excluir categoria ${c.name}`}
                      className="flex size-9 cursor-pointer items-center justify-center rounded-full text-dim hover:text-fg"
                    >
                      <TrashIcon />
                    </button>
                  </span>
                ) : (
                  <span key={c.id} className="flex items-center">
                    <button
                      onClick={() => setCatFilter(c.id)}
                      aria-pressed={catFilter === c.id}
                      className={`h-9 cursor-pointer rounded-l-full border px-3 text-[13px] font-semibold ${pill(catFilter === c.id)}`}
                    >
                      {c.name} <span className="opacity-70">{c.productCount}</span>
                    </button>
                    <button
                      onClick={() => setEditingCat({ id: c.id, name: c.name })}
                      disabled={!hasDb}
                      aria-label={`Renomear ou excluir categoria ${c.name}`}
                      className="flex h-9 w-8 cursor-pointer items-center justify-center rounded-r-full border border-l-0 border-line-2 text-dim hover:text-fg disabled:opacity-40"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 20h4L19 9l-4-4L4 16v4z" />
                      </svg>
                    </button>
                  </span>
                ),
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-line">
              {list.length === 0 && <p className="bg-panel-2 px-4 py-8 text-center text-dim">Nenhum produto aqui.</p>}
              {list.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-[#1C201E] bg-panel-2 px-4 py-3 last:border-b-0">
                  <button onClick={() => startEdit(p)} className={`w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg ${p.available ? "" : "opacity-45"}`} aria-label={`Editar ${p.name}`}>
                    <ProductMedia product={p} index={0} />
                  </button>
                  <div className="min-w-0 flex-[1_1_220px]">
                    <p className="text-[15px] leading-snug font-semibold">{p.name}</p>
                    <p className="mt-0.5 text-[13px] text-dim">
                      {p.category}
                      {p.subtype ? ` · ${p.subtype}` : ""} · Tam. {p.sizes.length ? p.sizes.join(", ") : "único"}
                      {p.photos.length === 0 && " · sem foto"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !p.available;
                      setAvailOverride((o) => ({ ...o, [p.id]: next }));
                      act(toggleAvailability(p.id, next), undefined, () =>
                        setAvailOverride((o) => {
                          const { [p.id]: _, ...rest } = o;
                          return rest;
                        }),
                      );
                    }}
                    disabled={!hasDb}
                    aria-pressed={p.available}
                    aria-label={`Disponibilidade de ${p.name}`}
                    className={`flex h-11 min-w-[150px] cursor-pointer items-center gap-2.5 rounded-full border border-line-2 py-0 pr-3 pl-1.5 text-sm font-bold disabled:opacity-50 ${p.available ? "text-lime" : "text-dim"}`}
                  >
                    <Switch on={p.available} />
                    {p.available ? "Disponível" : "Esgotado"}
                  </button>
                  <div className="flex">
                    <button
                      onClick={() => startEdit(p)}
                      aria-label={`Editar ${p.name}`}
                      className="flex size-11 cursor-pointer items-center justify-center rounded-[10px] text-dim hover:text-fg"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 20h4L19 9l-4-4L4 16v4z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir “${p.name}” do catálogo?`)) act(removeProduct(p.id), "Produto excluído");
                      }}
                      disabled={!hasDb}
                      aria-label={`Excluir ${p.name}`}
                      className="flex size-11 cursor-pointer items-center justify-center rounded-[10px] text-dim hover:text-[#FF8A80] disabled:opacity-40"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg ${
            toast.error ? "bg-[#FF8A80] text-ink" : "bg-fg text-ink"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="min-w-[120px] rounded-xl border border-line bg-panel px-4 py-3">
      <p className="text-xs font-bold tracking-[1px] text-dim uppercase">{label}</p>
      <p className={`mt-0.5 text-[28px] font-bold ${accent ? "text-lime" : ""}`}>{value}</p>
    </div>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span className={`relative inline-block h-6 w-10 shrink-0 rounded-full transition-colors ${on ? "bg-lime" : "bg-[#3A413C]"}`}>
      <span className={`absolute top-[3px] size-[18px] rounded-full bg-ink transition-[left] ${on ? "left-[19px]" : "left-[3px]"}`} />
    </span>
  );
}
