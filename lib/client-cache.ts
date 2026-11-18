// Lightweight client-side memory cache for high-speed navigation
const memoryCache = new Map<string, { data: any; expiry: number }>();

export async function fetchWithCache<T = any>(
  url: string,
  options?: RequestInit,
  ttlMs = 45000 // 45 seconds TTL
): Promise<T> {
  const isGet = !options || !options.method || options.method.toUpperCase() === "GET";

  if (isGet) {
    const entry = memoryCache.get(url);
    if (entry && Date.now() < entry.expiry) {
      return entry.data as T;
    }
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  const data = await res.json();

  if (isGet) {
    memoryCache.set(url, { data, expiry: Date.now() + ttlMs });
  }

  return data as T;
}

export function invalidateCache(urlPrefix?: string) {
  if (!urlPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of Array.from(memoryCache.keys())) {
    if (key.includes(urlPrefix)) {
      memoryCache.delete(key);
    }
  }
}
