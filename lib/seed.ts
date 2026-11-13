import type { Art } from "./types";

// Produtos de exemplo. Entram no banco só na primeira vez (banco vazio)
// e podem ser apagados pelo painel do lojista.
export const SEED_CATEGORIES = ["Camisas", "Chuteiras", "Bolas", "Acessórios"];

type SeedProduct = {
  name: string;
  category: string;
  subtype: string;
  sizes: string[];
  available: boolean;
  art: Art;
};

const SHIRT = ["P", "M", "G", "GG"];

export const SEED_PRODUCTS: SeedProduct[] = [
  { name: "Camisa Seleção Brasileira I 24/25", category: "Camisas", subtype: "Torcedor", sizes: SHIRT, available: true, art: { kind: "jersey", c1: "#F7D417", c2: "#0B7A3B" } },
  { name: "Camisa Bahia I 24/25", category: "Camisas", subtype: "Torcedor", sizes: SHIRT, available: true, art: { kind: "jersey", c1: "#FFFFFF", c2: "#1D4FA3" } },
  { name: "Camisa Vitória I 24/25", category: "Camisas", subtype: "Torcedor", sizes: SHIRT, available: true, art: { kind: "jersey", c1: "#D7192A", c2: "#111111" } },
  { name: "Camisa Flamengo I 24/25", category: "Camisas", subtype: "Torcedor", sizes: ["M", "G", "GG"], available: true, art: { kind: "jersey", c1: "#C8102E", c2: "#111111" } },
  { name: "Camisa Real Madrid I 24/25", category: "Camisas", subtype: "Torcedor", sizes: ["P", "M", "G"], available: false, art: { kind: "jersey", c1: "#F4F4F4", c2: "#B8912F" } },
  { name: "Camisa Argentina I 24/25", category: "Camisas", subtype: "Torcedor", sizes: SHIRT, available: true, art: { kind: "jersey", c1: "#8CC8F0", c2: "#FFFFFF" } },
  { name: "Camisa Treino 10 e FAIXA Dry", category: "Camisas", subtype: "Treino", sizes: [...SHIRT, "XGG"], available: true, art: { kind: "jersey", c1: "#141716", c2: "#C6F41F" } },
  { name: "Chuteira Nike Mercurial Vapor 16 Academy", category: "Chuteiras", subtype: "Society", sizes: ["38", "39", "40", "41", "42", "43"], available: true, art: { kind: "boot", c1: "#F2F2F2", c2: "#E6007E", sole: "turf" } },
  { name: "Chuteira Adidas Predator League", category: "Chuteiras", subtype: "Campo", sizes: ["39", "40", "41", "42"], available: true, art: { kind: "boot", c1: "#141414", c2: "#E8333A", sole: "studs" } },
  { name: "Chuteira Puma Future 7 Play", category: "Chuteiras", subtype: "Futsal", sizes: ["37", "38", "39", "40", "41"], available: true, art: { kind: "boot", c1: "#2F6BFF", c2: "#F2F4F0", sole: "flat" } },
  { name: "Chuteira Nike Phantom GX II Club", category: "Chuteiras", subtype: "Campo", sizes: ["40", "41", "42", "43", "44"], available: false, art: { kind: "boot", c1: "#C6F41F", c2: "#141414", sole: "studs" } },
  { name: "Bola Penalty Society S11 R2", category: "Bolas", subtype: "Society", sizes: [], available: true, art: { kind: "ball", c1: "#FFFFFF", c2: "#E8333A" } },
  { name: "Bola Adidas Champions League Club", category: "Bolas", subtype: "Campo", sizes: [], available: true, art: { kind: "ball", c1: "#F4F4F4", c2: "#1B2A5C" } },
  { name: "Caneleira Nike Charge", category: "Acessórios", subtype: "Proteção", sizes: ["P", "M", "G"], available: true, art: { kind: "guard", c1: "#141414", c2: "#C6F41F" } },
  { name: "Meião 10 e FAIXA Antiderrapante", category: "Acessórios", subtype: "Meião", sizes: [], available: true, art: { kind: "sock", c1: "#F2F4F0", c2: "#141414" } },
];

export const KIND_BY_CATEGORY: Record<string, Art["kind"]> = {
  Camisas: "jersey",
  Chuteiras: "boot",
  Bolas: "ball",
  "Acessórios": "guard",
};
