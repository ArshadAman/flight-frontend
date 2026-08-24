/** Unwrap Django `{ success, data }` envelopes and DRF `{ results }` lists. */

export function unwrapData<T = unknown>(json: unknown): T {
  if (json && typeof json === "object") {
    const row = json as { success?: boolean; data?: T };
    if (row.success && row.data !== undefined) return row.data;
  }
  return json as T;
}

export function unwrapList<T = unknown>(json: unknown): T[] {
  const inner = unwrapData<unknown>(json);
  if (Array.isArray(inner)) return inner as T[];
  if (inner && typeof inner === "object") {
    const row = inner as { results?: T[] };
    if (Array.isArray(row.results)) return row.results;
  }
  return [];
}
