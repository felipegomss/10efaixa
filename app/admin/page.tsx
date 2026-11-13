import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/AdminPanel";
import { isAdmin } from "@/lib/auth";
import { getCatalog, hasDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Estoque — 10 e FAIXA", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const { categories, products } = await getCatalog();
  return <AdminPanel categories={categories} products={products} hasDb={hasDb} hasBlob={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} />;
}
