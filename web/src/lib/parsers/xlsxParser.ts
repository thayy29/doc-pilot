/**
 * Parser para arquivos XLSX (Microsoft Excel).
 * Converte cada aba em texto tabular legível.
 */
export async function parseXlsx(buffer: Buffer): Promise<string> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const parts: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const csv = XLSX.utils.sheet_to_csv(sheet);
    if (csv.trim()) {
      parts.push(`## Aba: ${sheetName}\n\n${csv.trim()}`);
    }
  }

  if (parts.length === 0) {
    throw new Error("Não foi possível extrair dados do XLSX.");
  }

  return parts.join("\n\n---\n\n");
}
