import { redirect } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";
import { isAdmin } from "@/lib/auth";
import { getSettings, hasDb } from "@/lib/db";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Configurações — 10 e FAIXA", robots: { index: false } };

export default async function SettingsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const settings = await getSettings();
  return (
    <div className="min-h-screen bg-ink text-[15px] text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:px-8">
          <Wordmark size={24} />
          <span className="border-l border-line-2 pl-3.5 text-sm text-dim">Painel do lojista</span>
          <div className="grow" />
          <a href="/admin" className="inline-flex h-11 items-center rounded-full border border-line-2 px-4 text-sm font-semibold hover:border-dim">
            ← Voltar ao estoque
          </a>
        </div>
      </header>
      <main className="mx-auto flex max-w-[640px] flex-col gap-6 px-4 pt-8 pb-14 sm:px-8">
        <div>
          <h1 className="font-display text-[44px] leading-none font-extrabold uppercase">Configurações</h1>
          <p className="mt-2 text-muted">Contatos que aparecem no catálogo. Mudou de número? É só trocar aqui.</p>
        </div>
        <SettingsForm initial={settings} disabled={!hasDb} />
      </main>
    </div>
  );
}
