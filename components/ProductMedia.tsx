import type { Product } from "@/lib/types";
import { ART_VIEWS, ProductArt } from "./ProductArt";

/** Quantas "fotos" o produto tem: as reais ou, sem foto, as 3 vistas ilustradas. */
export function mediaCount(p: Product) {
  if (p.photos.length > 0) return p.photos.length;
  return p.art ? ART_VIEWS.length : 1;
}

export function mediaLabel(p: Product, i: number) {
  if (p.photos.length > 0) return `Foto ${i + 1}/${p.photos.length}`;
  if (!p.art) return "Sem foto";
  return `${ART_VIEWS[i].label} ${i + 1}/${ART_VIEWS.length}`;
}

/**
 * Foto do produto. `shape="portrait"` (padrão) usa 3:4, o formato das fotos de celular;
 * `shape="square"` é para miniaturas. `fit="contain"` mostra a foto inteira (zoom).
 */
export function ProductMedia({
  product,
  index,
  eager,
  shape = "portrait",
  fit = "cover",
}: {
  product: Product;
  index: number;
  eager?: boolean;
  shape?: "portrait" | "square";
  fit?: "cover" | "contain";
}) {
  const aspect = shape === "square" ? "aspect-square" : "aspect-[3/4]";
  if (product.photos.length > 0) {
    const src = product.photos[index % product.photos.length];
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${product.name} — foto ${index + 1}`}
        loading={eager ? "eager" : "lazy"}
        className={`${aspect} w-full ${fit === "contain" ? "bg-ink object-contain" : "bg-[#ECEEE8] object-cover"}`}
      />
    );
  }
  const v = ART_VIEWS[index % ART_VIEWS.length];
  return (
    <div className={`${aspect} w-full`}>
      <ProductArt art={product.art} view={v.view} bg={v.bg} label={`${product.name} — ${v.label}`} />
    </div>
  );
}
