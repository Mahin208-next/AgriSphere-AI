/**
 * Centralized API configuration for KrishiSetu AI
 * Supports single-host deployment and separated frontend/backend hosting.
 */

export const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Resolves API URL dynamically:
 * - If NEXT_PUBLIC_API_URL is configured (separate hosting), prepends the base URL.
 * - Otherwise returns the relative path (single host / local dev).
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (!BACKEND_API_BASE) {
    return cleanEndpoint;
  }
  return `${BACKEND_API_BASE.replace(/\/$/, "")}${cleanEndpoint}`;
}
