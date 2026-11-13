/** Informações da loja que o lojista pode mudar sozinho pelo painel. */
export type StoreSettings = {
  /** Só dígitos, com DDI 55 + DDD. Ex.: 557499446637 */
  whatsapp: string;
  /** Usuário do Instagram, sem @. */
  instagram: string;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "557499446637",
  instagram: "10efaixa_fut",
};

/** Número brasileiro em dígitos (com ou sem 55) → "(74) 9944-6637" / "(74) 99944-6637". */
export function formatPhoneBR(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const split = rest.length === 9 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

/** Valida e devolve o número no formato do WhatsApp (55 + DDD + número), ou null. */
export function normalizeWhatsapp(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  if (d[0] === "0") return null;
  return `55${d}`;
}

/** Aceita "@usuario", "usuario" ou o link do perfil. */
export function normalizeInstagram(raw: string): string | null {
  const v = raw
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/^@/, "");
  if (!v) return "";
  return /^[A-Za-z0-9._]{1,30}$/.test(v) ? v : null;
}
