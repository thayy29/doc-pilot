import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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

// ─── Dev Credentials Provider ─────────────────────────────────────────────
// Permite login com qualquer e-mail em desenvolvimento, sem OAuth configurado.
// NÃO use em produção.
if (isDev) {
  providers.push(
    Credentials({
      id: "credentials",
      name: "Dev Login",
      credentials: {
        email: { label: "E-mail", type: "email", placeholder: "dev@docpilot.local" },
        name:  { label: "Nome",  type: "text",  placeholder: "Dev User" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        if (!email) return null;

        const name = ((credentials?.name as string | undefined) ?? "").trim()
          || email.split("@")[0];

        // Busca ou cria o usuário automaticamente
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email, name },
        });

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT é necessário para o Credentials provider funcionar corretamente
  session: { strategy: "jwt" },
  // Fallback de secret para desenvolvimento local — nunca use em produção
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
    // Com estratégia JWT, o id do usuário vem do token
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

