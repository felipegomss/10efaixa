import "server-only";
import { neon } from "@neondatabase/serverless";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "./seed";
import type { Art, Category, Product } from "./types";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

/** Sem banco configurado (ex.: rodando local sem .env), o catálogo mostra os produtos de exemplo, só leitura. */
export const hasDb = Boolean(url);

const sql = url ? neon(url) : null;

function db() {
  if (!sql) throw new Error("Banco de dados não configurado (DATABASE_URL).");
  return sql;
}

let ready: Promise<void> | null = null;

/** Cria as tabelas na primeira chamada e, se o banco estiver vazio, insere os produtos de exemplo. */
export function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      const q = db();
      await q`CREATE TABLE IF NOT EXISTS categories (
        id serial PRIMARY KEY,
        name text NOT NULL UNIQUE,
        position int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await q`CREATE TABLE IF NOT EXISTS products (
        id serial PRIMARY KEY,
        name text NOT NULL,
        category_id int NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        subtype text NOT NULL DEFAULT '',
        sizes text[] NOT NULL DEFAULT '{}',
        available boolean NOT NULL DEFAULT true,
        photos text[] NOT NULL DEFAULT '{}',
        art jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      const [{ n }] = (await q`SELECT count(*)::int AS n FROM categories`) as { n: number }[];
      if (n === 0) await seed();
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

async function seed() {
  const q = db();
  const ids = new Map<string, number>();
  for (const [i, name] of SEED_CATEGORIES.entries()) {
    const [row] = (await q`INSERT INTO categories (name, position) VALUES (${name}, ${i})
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`) as { id: number }[];
    ids.set(name, row.id);
  }
  // Insere do último para o primeiro para que a ordem "mais novos primeiro" fique igual à lista.
  for (const p of [...SEED_PRODUCTS].reverse()) {
    await q`INSERT INTO products (name, category_id, subtype, sizes, available, art)
      VALUES (${p.name}, ${ids.get(p.category)!}, ${p.subtype}, ${p.sizes}, ${p.available}, ${JSON.stringify(p.art)}::jsonb)`;
  }
}

type ProductRow = {
  id: number;
  name: string;
  category_id: number;
  category: string;
  subtype: string;
  sizes: string[];
  available: boolean;
  photos: string[];
  art: Art | null;
};

function toProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    categoryId: r.category_id,
    category: r.category,
    subtype: r.subtype,
    sizes: r.sizes ?? [],
    available: r.available,
    photos: r.photos ?? [],
    art: r.art,
  };
}

function seedFallback(): { categories: Category[]; products: Product[] } {
  const categories = SEED_CATEGORIES.map((name, i) => ({
    id: i + 1,
    name,
    productCount: SEED_PRODUCTS.filter((p) => p.category === name).length,
  }));
  const products = SEED_PRODUCTS.map((p, i) => ({
    id: i + 1,
    name: p.name,
    categoryId: SEED_CATEGORIES.indexOf(p.category) + 1,
    category: p.category,
    subtype: p.subtype,
    sizes: p.sizes,
    available: p.available,
    photos: [],
    art: p.art,
  }));
  return { categories, products };
}

export async function getCatalog(): Promise<{ categories: Category[]; products: Product[] }> {
  if (!hasDb) return seedFallback();
  await ensureSchema();
  const q = db();
  const categories = (await q`
    SELECT c.id, c.name, count(p.id)::int AS "productCount"
    FROM categories c LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id ORDER BY c.position, c.id`) as Category[];
  const rows = (await q`
    SELECT p.*, c.name AS category
    FROM products p JOIN categories c ON c.id = p.category_id
    ORDER BY p.created_at DESC, p.id DESC`) as ProductRow[];
  return { categories, products: rows.map(toProduct) };
}

export type ProductInput = {
  name: string;
  categoryId: number;
  subtype: string;
  sizes: string[];
  available: boolean;
  photos: string[];
};

export async function createProduct(input: ProductInput) {
  await ensureSchema();
  await db()`INSERT INTO products (name, category_id, subtype, sizes, available, photos)
    VALUES (${input.name}, ${input.categoryId}, ${input.subtype}, ${input.sizes}, ${input.available}, ${input.photos})`;
}

export async function updateProduct(id: number, input: ProductInput) {
  await ensureSchema();
  await db()`UPDATE products SET name = ${input.name}, category_id = ${input.categoryId},
    subtype = ${input.subtype}, sizes = ${input.sizes}, available = ${input.available}, photos = ${input.photos}
    WHERE id = ${id}`;
}

export async function setAvailability(id: number, available: boolean) {
  await ensureSchema();
  await db()`UPDATE products SET available = ${available} WHERE id = ${id}`;
}

export async function deleteProduct(id: number): Promise<string[]> {
  await ensureSchema();
  const rows = (await db()`DELETE FROM products WHERE id = ${id} RETURNING photos`) as { photos: string[] }[];
  return rows[0]?.photos ?? [];
}

export async function createCategory(name: string): Promise<number> {
  await ensureSchema();
  const q = db();
  const existing = (await q`SELECT id FROM categories WHERE lower(name) = lower(${name})`) as { id: number }[];
  if (existing[0]) return existing[0].id;
  const [row] = (await q`INSERT INTO categories (name, position)
    VALUES (${name}, (SELECT coalesce(max(position), 0) + 1 FROM categories)) RETURNING id`) as { id: number }[];
  return row.id;
}

export async function renameCategory(id: number, name: string) {
  await ensureSchema();
  await db()`UPDATE categories SET name = ${name} WHERE id = ${id}`;
}

/** Só apaga categoria vazia. Retorna false se ainda houver produtos nela. */
export async function deleteCategory(id: number): Promise<boolean> {
  await ensureSchema();
  const q = db();
  const [{ n }] = (await q`SELECT count(*)::int AS n FROM products WHERE category_id = ${id}`) as { n: number }[];
  if (n > 0) return false;
  await q`DELETE FROM categories WHERE id = ${id}`;
  return true;
}
