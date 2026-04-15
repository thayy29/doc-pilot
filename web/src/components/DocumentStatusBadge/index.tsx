"use client";

import Badge from "@/components/Badge";
import type { DocumentStatus } from "@/hooks/useDocuments";

// Mapeia status do backend para rótulo e variante visual
const STATUS_MAP: Record<
  DocumentStatus,
  { label: string; variant: "info" | "warning" | "success" | "error" }
> = {
  PENDING: { label: "Pendente", variant: "info" },
  PROCESSING: { label: "Processando...", variant: "warning" },
  READY: { label: "Pronto", variant: "success" },
  FAILED: { label: "Falhou", variant: "error" },
};

type Props = {
  status: DocumentStatus;
};

export default function DocumentStatusBadge({ status }: Props) {
  const { label, variant } = STATUS_MAP[status] ?? {
    label: status,
    variant: "info",
  };

  return (
    <Badge variant={variant}>
      {status === "PROCESSING" && (
        <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-current" />
      )}
      {label}
    </Badge>
  );
}
