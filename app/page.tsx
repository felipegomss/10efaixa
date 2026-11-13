import { Catalog } from "@/components/Catalog";
import { getCatalog } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { categories, products } = await getCatalog();
  return (
    <Catalog
      categories={categories.filter((c) => c.productCount > 0).map((c) => c.name)}
      products={products}
      whatsapp={process.env.NEXT_PUBLIC_WHATSAPP || "557499446637"}
    />
  );
}
