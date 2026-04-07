"use client";

import { signOut, useSession } from "next-auth/react";

export default function AuthUserMenu() {
  const { data, status } = useSession();

  if (status === "loading") {
    return (
      <div className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground-muted">
        Carregando sessão...
      </div>
    );
  }

  if (!data?.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs font-semibold text-foreground-muted sm:inline">
        {data.user.email ?? data.user.name ?? "Usuário"}
      </span>
      <button
        onClick={() => signOut({ redirectTo: "/login" })}
        className="h-9 rounded-lg border border-border px-3 text-xs font-bold text-foreground hover:bg-subtle"
      >
        Sair
      </button>
    </div>
  );
}
