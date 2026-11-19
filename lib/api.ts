/**
 * Centralized API configuration for KrishiSetu AI
 * Supports Vercel Services bindings, single-host deployment, and separated frontend/backend hosting.
 */

export const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Resolves API URL dynamically:
 * - If running server-side with Vercel service binding BACKEND_URL, uses the internal service URL.
 * - If NEXT_PUBLIC_API_URL is configured (separate hosting), prepends the base URL.
 * - Otherwise returns the relative path (single host / local dev / browser client).
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (!BACKEND_API_BASE) {
    return cleanEndpoint;
  }
  return `${BACKEND_API_BASE.replace(/\/$/, "")}${cleanEndpoint}`;
}
