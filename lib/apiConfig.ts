/** Production backend — used when env vars are unset (no localhost fallback). */
const PROD_BACKEND_URL = "https://portion-wiley-events-flow.trycloudflare.com";
const PROD_PUBLIC_API_URL = `${PROD_BACKEND_URL}/api/v1`;

/** Server-side BFF routes: `BACKEND_API_URL` */
export function getBackendApiUrl(): string {
  const url = process.env.BACKEND_API_URL || PROD_BACKEND_URL;
  return url.replace(/\/$/, "");
}

/** Client + server calls to `/api/v1`: `NEXT_PUBLIC_API_URL` */
export function getPublicApiUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.BACKEND_API_URL
      ? `${process.env.BACKEND_API_URL.replace(/\/$/, "")}/api/v1`
      : PROD_PUBLIC_API_URL);
  return configured.replace(/\/$/, "");
}
