"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import * as db from "@/lib/db";
import { normalizeInstagram, normalizeWhatsapp } from "@/lib/settings";

export type ActionResult = { ok: true } | { ok: false; error: string };

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/configuracoes");
}

async function run(fn: () => Promise<void | string>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const err = await fn();
    if (typeof err === "string") return { ok: false, error: err };
    refresh();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e instanceof Error ? e.message : "Algo deu errado. Tente de novo." };
  }
}

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const password = String(form.get("password") ?? "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600));
    return "Senha incorreta.";
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

function cleanInput(input: db.ProductInput): db.ProductInput | string {
  const name = input.name.trim();
  if (name.length < 2) return "Dê um nome ao produto.";
  if (!Number.isInteger(input.categoryId)) return "Escolha uma categoria.";
  const sizes = [...new Set(input.sizes.map((s) => s.trim()).filter(Boolean))].slice(0, 20);
  const photos = input.photos.filter((u) => /^https:\/\//.test(u)).slice(0, 8);
  return { name: name.slice(0, 160), categoryId: input.categoryId, subtype: input.subtype.trim().slice(0, 60), sizes, available: !!input.available, photos };
}

export async function saveProduct(id: number | null, input: db.ProductInput) {
  return run(async () => {
    const clean = cleanInput(input);
    if (typeof clean === "string") return clean;
    if (id === null) await db.createProduct(clean);
    else await db.updateProduct(id, clean);
  });
}

export async function toggleAvailability(id: number, available: boolean) {
  return run(() => db.setAvailability(id, available));
}

export async function removeProduct(id: number) {
  return run(async () => {
    const photos = await db.deleteProduct(id);
    await deletePhotos(photos);
  });
}

/** Apaga do Blob fotos que foram enviadas e depois descartadas. */
export async function discardPhotos(urls: string[]) {
  return run(() => deletePhotos(urls));
}

async function deletePhotos(urls: string[]) {
  const ours = urls.filter((u) => u.includes(".blob.vercel-storage.com/"));
  if (ours.length === 0 || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(ours);
  } catch (e) {
    console.error("Falha ao apagar fotos", e);
  }
}

export async function updateSettings(input: { whatsapp: string; instagram: string }) {
  return run(async () => {
    const whatsapp = normalizeWhatsapp(input.whatsapp);
    if (!whatsapp) return "WhatsApp inválido. Use DDD + número, ex.: (74) 99944-6637.";
    const instagram = normalizeInstagram(input.instagram);
    if (instagram === null) return "Instagram inválido. Use só o usuário, ex.: 10efaixa_fut.";
    await db.saveSettings({ whatsapp, instagram });
  });
}

export async function addCategory(name: string): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const clean = name.trim().slice(0, 40);
    if (clean.length < 2) return { ok: false, error: "Nome muito curto." };
    const id = await db.createCategory(clean);
    refresh();
    return { ok: true, id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Não foi possível criar a categoria." };
  }
}

export async function editCategory(id: number, name: string) {
  return run(async () => {
    const clean = name.trim().slice(0, 40);
    if (clean.length < 2) return "Nome muito curto.";
    try {
      await db.renameCategory(id, clean);
    } catch {
      return "Já existe uma categoria com esse nome.";
    }
  });
}

export async function removeCategory(id: number) {
  return run(async () => {
    const ok = await db.deleteCategory(id);
    if (!ok) return "Essa categoria ainda tem produtos. Mova ou exclua os produtos antes.";
  });
}
