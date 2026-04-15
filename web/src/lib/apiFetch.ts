/**
 * Generic fetch wrapper for the internal API.
 * Throws an error with the API error message when the response is not ok.
 *
 * Envelope esperado:  { ok: true,  data: T }
 *                  ou { ok: false, error: { code, message } }
 */
async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  // Só injeta Content-Type se não for FormData (upload multipart)
  const isFormData = options?.body instanceof FormData;
  const defaultHeaders: HeadersInit = isFormData
    ? {}
    : { "Content-Type": "application/json" };

  const res = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const payload = await res.json();

  if (!res.ok || payload?.ok === false) {
    const message =
      payload?.error?.message ?? payload?.message ?? "Unexpected error";
    throw new Error(message);
  }

  // Suporta envelope { ok: true, data: T } e resposta direta T
  return ("data" in payload ? payload.data : payload) as T;
}

export default apiFetch;
