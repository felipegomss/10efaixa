"use client";

import { useState, useTransition } from "react";
import { formatPhoneBR, normalizeInstagram, normalizeWhatsapp, type StoreSettings } from "@/lib/settings";
import { updateSettings } from "../actions";

export function SettingsForm({ initial, disabled }: { initial: StoreSettings; disabled: boolean }) {
  const [phone, setPhone] = useState(formatPhoneBR(initial.whatsapp));
  const [insta, setInsta] = useState(initial.instagram ? `@${initial.instagram}` : "");
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [pending, start] = useTransition();

  const wa = normalizeWhatsapp(phone);
  const ig = normalizeInstagram(insta);
  const phoneDigits = phone.replace(/\D/g, "").length;
  const phoneError = phoneDigits > 0 && !wa && phoneDigits >= 10 ? "Número inválido." : null;
  const canSave = !disabled && !!wa && ig !== null && !pending;

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    start(async () => {
      const r = await updateSettings({ whatsapp: phone, instagram: insta });
      setMsg(r.ok ? { text: "Configurações salvas ✓ O catálogo já está atualizado." } : { text: r.error, error: true });
    });
  }

  const input = "h-12 rounded-xl border border-line-2 bg-ink px-4 text-base text-fg outline-none placeholder:text-dim focus:border-lime";

  return (
    <form onSubmit={save} className="flex flex-col gap-5 rounded-2xl border border-line bg-panel p-5 sm:p-6">
      {disabled && <p className="text-sm text-[#F5D38A]">Banco de dados não conectado: as configurações não podem ser salvas ainda.</p>}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="whats" className="text-[13px] font-semibold text-muted">
          WhatsApp que recebe os pedidos
        </label>
        <div className="flex items-center gap-2">
          <span className="flex h-12 items-center rounded-xl border border-line-2 bg-panel-2 px-3 text-muted" aria-hidden="true">
            +55
          </span>
          <input
            id="whats"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={phone}
            onChange={(e) => setPhone(formatPhoneBR(e.target.value))}
            placeholder="(74) 99944-6637"
            aria-describedby="whats-help"
            aria-invalid={!!phoneError}
            className={`${input} min-w-0 grow`}
          />
        </div>
        <span id="whats-help" className={`text-xs ${phoneError ? "text-[#FF8A80]" : "text-dim"}`}>
          {phoneError ?? "DDD + número. Os pedidos do catálogo chegam nesse WhatsApp."}
        </span>
        {wa && (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="w-fit text-[13px] text-lime">
            Testar: abrir conversa com {formatPhoneBR(wa)} ↗
          </a>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="insta" className="text-[13px] font-semibold text-muted">
          Instagram
        </label>
        <input
          id="insta"
          value={insta}
          onChange={(e) => {
            const v = e.target.value.replace(/\s/g, "");
            setInsta(v && !v.startsWith("@") && !v.includes("/") ? `@${v}` : v);
          }}
          placeholder="@10efaixa_fut"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={ig === null}
          className={input}
        />
        <span className={`text-xs ${ig === null ? "text-[#FF8A80]" : "text-dim"}`}>
          {ig === null ? "Use só letras, números, ponto e _ (pode colar o link do perfil)." : "Deixe vazio para esconder o Instagram do catálogo."}
        </span>
      </div>

      <button
        type="submit"
        disabled={!canSave}
        className="h-12 cursor-pointer rounded-xl bg-lime text-[15px] font-extrabold text-ink disabled:cursor-not-allowed disabled:bg-line disabled:text-dim"
      >
        {pending ? "Salvando…" : "Salvar configurações"}
      </button>
      {msg && (
        <p role="status" className={`text-sm ${msg.error ? "text-[#FF8A80]" : "text-lime"}`}>
          {msg.text}
        </p>
      )}
    </form>
  );
}
