import { redirect } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Área do lojista — 10 e FAIXA", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-10">
      <div className="flex w-full max-w-[420px] flex-col gap-7">
        <div className="px-1">
          <Wordmark size={26} />
        </div>
        <div>
          <h1 className="mb-1.5 font-display text-[40px] leading-none font-extrabold uppercase">Área do lojista</h1>
          <p className="text-[15px] leading-normal text-muted">Marque o que tem em estoque e cadastre produtos novos.</p>
        </div>
        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="rounded-xl border border-line bg-panel p-4 text-sm text-muted">
            A senha do lojista ainda não foi configurada. Defina a variável <code className="text-lime">ADMIN_PASSWORD</code> no projeto da Vercel.
          </p>
        )}
        <a href="/" className="flex items-center gap-1.5 text-sm text-dim hover:text-fg">
          ← Voltar ao catálogo
        </a>
      </div>
    </main>
  );
}
