import { Queue } from "bullmq";

/**
 * Fila para processamento assíncrono de documentos.
 * Este arquivo é seguro para importação dentro do Next.js (App Router).
 * O Worker roda em processo separado (scripts/worker.ts).
 *
 * A instanciação é lazy para evitar erro no build quando o Redis não está disponível.
 */

export interface DocumentJobData {
  documentId: string;
}

let _queue: Queue<DocumentJobData> | null = null;

export function getDocumentQueue(): Queue<DocumentJobData> {
  if (!_queue) {
    _queue = new Queue<DocumentJobData>("documents", {
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });
  }
  return _queue;
}
