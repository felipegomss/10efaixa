export type ArtKind = "jersey" | "boot" | "ball" | "guard" | "sock";

export type Art = {
  kind: ArtKind;
  c1: string;
  c2: string;
  sole?: "studs" | "turf" | "flat";
};

export type Category = {
  id: number;
  name: string;
  productCount: number;
};

export type Product = {
  id: number;
  name: string;
  categoryId: number;
  category: string;
  subtype: string;
  sizes: string[];
  available: boolean;
  photos: string[];
  art: Art | null;
};
