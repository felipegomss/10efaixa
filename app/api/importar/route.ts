import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { checkPassword } from "@/lib/auth";
import * as db from "@/lib/db";

/**
 * Rota de importação para cadastrar produtos de fora do painel (ex.: a partir das fotos do WhatsApp).
 * Autenticação: header `Authorization: Bearer <senha do lojista>`.
 *
 * GET    → lista categorias e produtos
 * POST   → cria ou atualiza um produto (pelo `id` ou pelo nome)
 * DELETE → ?id=123 remove o produto e as fotos
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PhotoInput = string | { data: string; type?: string; name?: string };

type ProductPayload = {
  id?: number;
  name: string;
  category: string;
  subtype?: string;
  sizes?: string[];
  available?: boolean;
  photos?: PhotoInput[];
  /** true: as fotos enviadas substituem as atuais. Padrão: acrescenta. */
  replacePhotos?: boolean;
};

function authorized(req: Request) {
  const h = req.headers.get("authorization") ?? "";
  const token = h.replace(/^Bearer\s+/i, "");
  return token.length > 0 && checkPassword(token);
}

const unauthorized = () => NextResponse.json({ error: "Não autorizado" }, { status: 401 });

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function GET(req: Request) {
  if (!authorized(req)) return unauthorized();
  return NextResponse.json(await db.getCatalog());
}

export async function POST(req: Request) {
  if (!authorized(req)) return unauthorized();
  if (!db.hasDb) return NextResponse.json({ error: "Banco não configurado" }, { status: 500 });

  let body: ProductPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const name = (body.name ?? "").trim().slice(0, 160);
  const categoryName = (body.category ?? "").trim().slice(0, 40);
  if (name.length < 2 || categoryName.length < 2) {
    return NextResponse.json({ error: "Informe name e category" }, { status: 400 });
  }

  const { products } = await db.getCatalog();
  const existing =
    body.id != null
      ? products.find((p) => p.id === body.id)
      : products.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (body.id != null && !existing) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  // Sobe as fotos novas para o Blob.
  const uploaded: string[] = [];
  for (const [i, photo] of (body.photos ?? []).entries()) {
    if (typeof photo === "string") {
      if (/^https:\/\//.test(photo)) uploaded.push(photo);
      continue;
    }
    const type = photo.type && /^image\/(jpeg|png|webp|avif)$/.test(photo.type) ? photo.type : "image/jpeg";
    const ext = type.split("/")[1].replace("jpeg", "jpg");
    const bytes = Buffer.from(photo.data, "base64");
    if (bytes.length === 0 || bytes.length > 4 * 1024 * 1024) {
      return NextResponse.json({ error: `Foto ${i + 1} vazia ou maior que 4 MB` }, { status: 400 });
    }
    const blob = await put(`produtos/${slugify(name)}.${ext}`, bytes, { access: "public", addRandomSuffix: true, contentType: type });
    uploaded.push(blob.url);
  }

  const categoryId = await db.createCategory(categoryName);
  const sizes = [...new Set((body.sizes ?? []).map((s) => String(s).trim()).filter(Boolean))].slice(0, 20);
  const subtype = (body.subtype ?? "").trim().slice(0, 60);

  if (existing) {
    const keep = body.replacePhotos ? [] : existing.photos;
    const photos = [...keep, ...uploaded].slice(0, 8);
    const removed = existing.photos.filter((u) => !photos.includes(u));
    await db.updateProduct(existing.id, {
      name,
      categoryId,
      subtype: body.subtype !== undefined ? subtype : existing.subtype,
      sizes: body.sizes !== undefined ? sizes : existing.sizes,
      available: body.available ?? existing.available,
      photos,
    });
    await deleteBlobs(removed);
  } else {
    await db.createProduct({ name, categoryId, subtype, sizes, available: body.available ?? true, photos: uploaded.slice(0, 8) });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  const after = (await db.getCatalog()).products.find((p) => p.name.toLowerCase() === name.toLowerCase());
  return NextResponse.json({ ok: true, action: existing ? "updated" : "created", product: after });
}

export async function DELETE(req: Request) {
  if (!authorized(req)) return unauthorized();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Informe ?id=" }, { status: 400 });
  const photos = await db.deleteProduct(id);
  await deleteBlobs(photos);
  revalidatePath("/");
  revalidatePath("/admin");
  return NextResponse.json({ ok: true });
}

async function deleteBlobs(urls: string[]) {
  const ours = urls.filter((u) => u.includes(".blob.vercel-storage.com/"));
  if (ours.length === 0) return;
  try {
    await del(ours);
  } catch (e) {
    console.error("Falha ao apagar fotos", e);
  }
}
