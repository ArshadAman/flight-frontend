// Minimal fetch wrapper that attaches Authorization header and handles refresh
export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}, getAccess: () => string | null, refreshAccess: () => Promise<boolean>) {
  let access = getAccess()
  const headers = new Headers(init.headers || {})
  if (access) headers.set('Authorization', `Bearer ${access}`)
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json')

  const requestInit: RequestInit = {
    ...init,
    headers,
  }

  if (init.credentials) {
    requestInit.credentials = init.credentials
  }

  let res = await fetch(input, requestInit)
  if (res.status === 401) {
    const ok = await refreshAccess()
    if (!ok) return res
    access = getAccess()
    if (access) {
      headers.set('Authorization', `Bearer ${access}`)
      res = await fetch(input, requestInit)
    }
  }
  return res
}

export default fetchWithAuth
