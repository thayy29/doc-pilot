"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// Validação client-side espelhando as regras do signUpSchema (backend)
function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim() || form.name.trim().length < 2)
    errors.name = "Nome deve ter pelo menos 2 caracteres.";
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "E-mail inválido.";
  if (form.password.length < 8)
    errors.password = "Senha deve ter pelo menos 8 caracteres.";
  else if (!/[A-Z]/.test(form.password))
    errors.password = "Senha deve conter ao menos uma letra maiúscula.";
  else if (!/[0-9]/.test(form.password))
    errors.password = "Senha deve conter ao menos um número.";
  if (form.password !== form.confirmPassword)
    errors.confirmPassword = "As senhas não coincidem.";
  return errors;
}

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "", email: "", password: "", confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (fieldErrors[field])
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      // 1. Cria a conta
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 422 && json?.error?.details) {
          const details = json.error.details as Record<string, string[]>;
          const mapped: FieldErrors = {};
          for (const [key, msgs] of Object.entries(details))
            mapped[key as keyof FieldErrors] = msgs[0];
          setFieldErrors(mapped);
        } else {
          setFieldErrors({ general: json?.error?.message ?? "Erro ao criar conta." });
        }
        return;
      }

      // 2. Login automático com as credenciais criadas
      const result = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setFieldErrors({ general: "Conta criada! Faça login para continuar." });
        router.push("/login");
      } else {
        router.replace("/projects");
      }
    } catch {
      setFieldErrors({ general: "Erro de conexão. Verifique sua rede." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-foreground">DocPilot</h1>
          <p className="mt-1 text-sm font-semibold text-foreground-muted">
            Crie sua conta para começar
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-black text-foreground">Criar conta</h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            {/* Erro geral */}
            {fieldErrors.general && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs font-semibold text-destructive">
                {fieldErrors.general}
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="mb-1.5 block text-xs font-black text-foreground">
                Nome <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="Seu nome completo"
                autoComplete="name"
                autoFocus
                disabled={loading}
                className={[
                  "w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground",
                  "placeholder-foreground-muted focus:outline-none focus:ring-1",
                  fieldErrors.name
                    ? "border-destructive focus:border-destructive focus:ring-destructive"
                    : "border-border focus:border-brand focus:ring-brand",
                  "disabled:opacity-50",
                ].join(" ")}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs font-semibold text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            {/* E-mail */}
            <div>
              <label className="mb-1.5 block text-xs font-black text-foreground">
                E-mail <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="voce@exemplo.com"
                autoComplete="email"
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
              <label className="mb-1.5 block text-xs font-black text-foreground">
                Senha <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
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
              {fieldErrors.password ? (
                <p className="mt-1 text-xs font-semibold text-destructive">{fieldErrors.password}</p>
              ) : (
                <p className="mt-1 text-xs font-semibold text-foreground-muted">
                  Mínimo 8 caracteres, 1 maiúscula e 1 número.
                </p>
              )}
            </div>

            {/* Confirmar senha */}
            <div>
              <label className="mb-1.5 block text-xs font-black text-foreground">
                Confirmar senha <span className="text-destructive">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                placeholder="Repita a senha"
                autoComplete="new-password"
                disabled={loading}
                className={[
                  "w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground",
                  "placeholder-foreground-muted focus:outline-none focus:ring-1",
                  fieldErrors.confirmPassword
                    ? "border-destructive focus:border-destructive focus:ring-destructive"
                    : "border-border focus:border-brand focus:ring-brand",
                  "disabled:opacity-50",
                ].join(" ")}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs font-semibold text-destructive">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl bg-brand px-4 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs font-semibold text-foreground-muted">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-bold text-brand hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
