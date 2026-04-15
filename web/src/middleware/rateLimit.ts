import type { NextRequest } from "next/server";

// Simples rate limit em memória (MVP, não use em produção!)
const ipHits = new Map<string, { count: number; last: number }>();
const WINDOW = 60 * 1000; // 1 min
const LIMIT = 30; // 30 req/min

export function rateLimit(req: NextRequest): Response | undefined {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const now = Date.now();
  const entry = ipHits.get(ip) || { count: 0, last: now };
  if (now - entry.last > WINDOW) {
    entry.count = 0;
    entry.last = now;
  }
  entry.count++;
  ipHits.set(ip, entry);
  if (entry.count > LIMIT) {
    return new Response("Too Many Requests", { status: 429 });
  }
}
