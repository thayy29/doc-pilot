export function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
