/** Production backend — used when env vars are unset (no localhost fallback). */
const PROD_BACKEND_URL = "https://api.occ.services";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Origin only (no `/api/v1`) for BFF proxy path construction. */
function toBackendOrigin(url: string): string {
  return stripTrailingSlash(url).replace(/\/api\/v1$/i, "");
}

/** Always ends with `/api/v1` for client API calls. */
function toPublicApiBase(url: string): string {
  const origin = toBackendOrigin(url);
  return `${origin}/api/v1`;
}

/** Server-side BFF routes: `BACKEND_API_URL` (origin, no /api/v1). */
export function getBackendApiUrl(): string {
  return toBackendOrigin(process.env.BACKEND_API_URL || PROD_BACKEND_URL);
}

/**
 * Client + server calls under `/api/v1`: `NEXT_PUBLIC_API_URL`.
 * Accepts either `https://host` or `https://host/api/v1` and normalizes.
 */
export function getPublicApiUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BACKEND_API_URL ||
    PROD_BACKEND_URL;
  return toPublicApiBase(configured);
}
