"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

interface FieldErrors {
  email?: string;
  password?: string;
  general?: string;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/projects";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const clearError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Informe seu e-mail.";
    if (!password)     errors.password = "Informe sua senha.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setFieldErrors({});

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setFieldErrors({ general: "E-mail ou senha incorretos." });
    } else {
      router.replace(callbackUrl);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-foreground">DocPilot</h1>
          <p className="mt-1 text-sm font-semibold text-foreground-muted">
            Entre com sua conta para continuar
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-black text-foreground">Entrar</h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            {/* Erro geral */}
            {fieldErrors.general && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs font-semibold text-destructive">
                {fieldErrors.general}
              </div>
            )}

            {/* E-mail */}
            <div>
              <label className="mb-1.5 block text-xs font-black text-foreground">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                placeholder="voce@exemplo.com"
                autoComplete="email"
                autoFocus
                disabled={loading}
                className={[
                  "w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground",
                  "placeholder-foreground-muted focus:outline-none focus:ring-1",
                  fieldErrors.email
                    ? "border-destructive focus:border-destructive focus:ring-destructive"
                    : "border-border focus:border-brand focus:ring-brand",
                  "disabled:opacity-50",
                ].join(" ")}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs font-semibold text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-black text-foreground">Senha</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  disabled={loading}
                  className={[
                    "w-full rounded-xl border bg-background px-4 py-2.5 pr-20 text-sm font-semibold text-foreground",
                    "placeholder-foreground-muted focus:outline-none focus:ring-1",
                    fieldErrors.password
                      ? "border-destructive focus:border-destructive focus:ring-destructive"
                      : "border-border focus:border-brand focus:ring-brand",
                    "disabled:opacity-50",
                  ].join(" ")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-foreground-muted hover:text-foreground"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs font-semibold text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl bg-brand px-4 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs font-semibold text-foreground-muted">
            Não tem uma conta?{" "}
            <Link href="/signup" className="font-bold text-brand hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
