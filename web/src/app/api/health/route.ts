import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Health check completo do sistema.
 * GET /api/health
 *
 * Valida:
 * - Servidor rodando
 * - Banco de dados conectado
 * - Tempo de resposta
 */
export async function GET() {
  const startTime = Date.now();

  const checks: Record<string, boolean | string> = {
    server: true,
    database: false,
  };

  // Verifica banco de dados
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (err) {
    checks.database = `Database error: ${err instanceof Error ? err.message : "unknown"}`;
  }

  const responseTime = Date.now() - startTime;
  const allHealthy = Object.values(checks).every((v) => v === true);

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      checks,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      version: "0.1.0",
      environment: process.env.NODE_ENV ?? "development",
    },
    { status: allHealthy ? 200 : 503 },
  );
}
