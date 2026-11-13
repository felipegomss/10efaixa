import { Catalog } from "@/components/Catalog";
import { getCatalog, getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ categories, products }, settings] = await Promise.all([getCatalog(), getSettings()]);
  return (
    <Catalog
      categories={categories.filter((c) => c.productCount > 0).map((c) => c.name)}
      products={products}
      whatsapp={settings.whatsapp}
      instagram={settings.instagram}
    />
  );
}
