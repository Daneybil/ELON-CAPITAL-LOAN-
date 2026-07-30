/**
 * Resolves the full API URL for a given endpoint path.
 * In development or unified full-stack server mode (Railway container serving both client and API),
 * returns relative paths `/api/...`.
 * If deployed cross-origin (e.g. Vercel frontend calling separate Railway backend URL),
 * prepends `import.meta.env.VITE_API_URL`.
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  if (!baseUrl) {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
}
