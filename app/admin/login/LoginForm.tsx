"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-[13px] font-semibold text-muted">
          Senha de acesso
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="h-[52px] rounded-xl border border-line-2 bg-panel px-4 text-lg tracking-[4px] outline-none focus:border-lime"
        />
        {error && (
          <p role="alert" className="text-sm text-[#FF8A80]">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-[52px] cursor-pointer rounded-xl bg-lime text-base font-extrabold text-ink disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar no painel"}
      </button>
    </form>
  );
}
