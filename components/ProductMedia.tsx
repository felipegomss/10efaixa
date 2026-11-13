import type { Product } from "@/lib/types";
import { ART_VIEWS, ProductArt } from "./ProductArt";

/** Quantas "fotos" o produto tem: as reais ou, sem foto, as 3 vistas ilustradas. */
export function mediaCount(p: Product) {
  return p.photos.length > 0 ? p.photos.length : ART_VIEWS.length;
}

export function mediaLabel(p: Product, i: number) {
  if (p.photos.length > 0) return `Foto ${i + 1}/${p.photos.length}`;
  return `${ART_VIEWS[i].label} ${i + 1}/${ART_VIEWS.length}`;
}

export function ProductMedia({ product, index, eager }: { product: Product; index: number; eager?: boolean }) {
  if (product.photos.length > 0) {
    const src = product.photos[index % product.photos.length];
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${product.name} — foto ${index + 1}`}
        loading={eager ? "eager" : "lazy"}
        className="aspect-square w-full bg-[#ECEEE8] object-cover"
      />
    );
  }
  const v = ART_VIEWS[index % ART_VIEWS.length];
  return <ProductArt art={product.art} view={v.view} bg={v.bg} label={`${product.name} — ${v.label}`} />;
}
