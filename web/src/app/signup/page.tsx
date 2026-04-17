"use client";

import Link from "next/link";
import { getProviders, signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") || "/projects";

  const [providers, setProviders] = useState<Record<string, { id: string; name: string }>>({});
  const [devEmail, setDevEmail]   = useState("");
  const [devName,  setDevName]    = useState("");
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState<string | null>(null);

  const providerList   = useMemo(() => Object.values(providers), [providers]);
  const oauthProviders = useMemo(
    () => providerList.filter((p) => p.id !== "credentials"),
    [providerList],
  );
  const hasDevCredentials = providerList.some((p) => p.id === "credentials");

  useEffect(() => {
    if (status === "authenticated") router.replace(callbackUrl);
  }, [status, callbackUrl, router]);

  useEffect(() => {
    getProviders().then((data) => { if (data) setProviders(data); });
  }, []);

  const handleDevSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devEmail.trim()) return;
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email: devEmail.trim(),
      name:  devName.trim() || undefined,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Não foi possível criar o acesso. Verifique o banco de dados.");
    } else {
      router.replace(callbackUrl);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-xl font-black text-foreground">Criar conta no DocPilot</h1>
        <p className="mt-2 text-sm font-medium text-foreground-muted">
          Ao entrar pela primeira vez, sua conta é criada automaticamente.
        </p>

        {/* Providers OAuth */}
        {oauthProviders.length > 0 && (
          <div className="mt-6 grid gap-3">
            {oauthProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => signIn(provider.id, { callbackUrl })}
                className="h-11 rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground hover:bg-subtle"
              >
                Criar com {provider.name}
              </button>
            ))}
          </div>
        )}

        {/* Separador */}
        {oauthProviders.length > 0 && hasDevCredentials && (
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-foreground-muted">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}

        {/* Dev Credentials Form */}
        {hasDevCredentials && (
          <form onSubmit={handleDevSignUp} className="mt-4 space-y-3">
            <div className="rounded-lg border border-warning-border bg-warning-subtle px-3 py-2 text-xs font-semibold text-warning-text">
              🛠 Dev Login — apenas em desenvolvimento
            </div>
            <input
              type="email"
              placeholder="E-mail"
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground placeholder-foreground-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <input
              type="text"
              placeholder="Nome (opcional)"
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground placeholder-foreground-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {error && (
              <p className="text-xs font-semibold text-destructive">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !devEmail.trim()}
              className="h-11 w-full rounded-xl bg-brand px-4 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Criando acesso..." : "Criar e entrar"}
            </button>
          </form>
        )}

        {/* Nenhum provider */}
        {!hasDevCredentials && oauthProviders.length === 0 && (
          <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs font-semibold text-destructive">
            Nenhum provider configurado. Defina as variáveis no <code>.env</code>.
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

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  );
}
