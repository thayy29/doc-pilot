import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/shared/validation";
import { authService } from "@/server/services";

const isDev = process.env.NODE_ENV === "development";

const providers: Provider[] = [];

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  );
}

if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  );
}

// ─── Credentials Provider (e-mail + senha) ────────────────────────────────
// Funciona em qualquer ambiente. Requer cadastro via POST /api/auth/signup.
providers.push(
  Credentials({
    id: "credentials",
    name: "E-mail e senha",
    credentials: {
      email:    { label: "E-mail",  type: "email"    },
      password: { label: "Senha",   type: "password" },
    },
    async authorize(credentials) {
      // Valida formato via Zod antes de tocar o banco
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;

      try {
        const user = await authService.validateCredentials(
          parsed.data.email,
          parsed.data.password,
        );
        return { id: user.id, name: user.name, email: user.email };
      } catch {
        // validateCredentials lança UnauthorizedError — retorna null para o Auth.js
        return null;
      }
    },
  }),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT é obrigatório para o Credentials provider funcionar
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET
    ?? process.env.NEXTAUTH_SECRET
    ?? (isDev ? "dev-secret-docpilot-change-in-production" : undefined),
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  providers,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const publicPaths = ["/login", "/signup", "/api/auth", "/api/health"];
      const isPublicPath = publicPaths.some((path) =>
        nextUrl.pathname.startsWith(path),
      );
      if (isPublicPath) return true;
      return !!auth;
    },
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  debug: isDev,
  trustHost: true,
});


