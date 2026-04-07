"use client";

import Link from "next/link";
import { getProviders, signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [providers, setProviders] = useState<Record<string, { id: string; name: string }>>({});
  const providerList = useMemo(() => Object.values(providers), [providers]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  useEffect(() => {
    getProviders().then((data) => {
      if (data) {
        setProviders(data);
      }
    });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-xl font-black text-foreground">Criar conta no DocPilot</h1>
        <p className="mt-2 text-sm font-medium text-foreground-muted">
          Ao entrar com OAuth pela primeira vez, seu usuário é criado automaticamente.
        </p>

        {providerList.length > 0 ? (
          <div className="mt-6 grid gap-3">
            {providerList.map((provider) => (
              <button
                key={provider.id}
                onClick={() => signIn(provider.id, { redirectTo: callbackUrl })}
                className="h-11 rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground hover:bg-subtle"
              >
                Criar com {provider.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-warning-border bg-warning-subtle p-3 text-xs font-semibold text-warning-text">
            Nenhum provider OAuth configurado. Defina GITHUB_ID/GITHUB_SECRET ou
            GOOGLE_ID/GOOGLE_SECRET no .env.
          </div>
        )}

        <p className="mt-5 text-xs font-medium text-foreground-muted">
          Já tem conta?{" "}
          <Link href="/login" className="font-bold text-brand">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
