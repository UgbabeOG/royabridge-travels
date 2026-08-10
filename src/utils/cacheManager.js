/**
 * Advanced Client-Side Cache Manager
 * Provides Memory & LocalStorage tier caching with TTL & Stale-While-Revalidate.
 */

const MEMORY_CACHE = new Map();
const DEFAULT_TTL_SECONDS = 900; // 15 minutes default

export const CacheManager = {
  /**
   * Get item from cache (Memory first, then LocalStorage)
   */
  get(key) {
    const now = Date.now();

    // 1. Check in-memory cache
    if (MEMORY_CACHE.has(key)) {
      const entry = MEMORY_CACHE.get(key);
      if (now < entry.expiry) {
        return { data: entry.data, isStale: false, source: 'memory' };
      }
      // Stale entry
      MEMORY_CACHE.delete(key);
    }

    // 2. Check LocalStorage
    try {
      const raw = localStorage.getItem(`roya_cache_${key}`);
      if (raw) {
        const entry = JSON.parse(raw);
        if (now < entry.expiry) {
          // Populate memory cache for faster subsequent reads
          MEMORY_CACHE.set(key, entry);
          return { data: entry.data, isStale: false, source: 'localStorage' };
        } else {
          // Allow stale-while-revalidate if within 2x TTL
          const staleGracePeriod = entry.ttlMs ? entry.ttlMs * 2 : 1800000;
          if (now < entry.expiry + staleGracePeriod) {
            return { data: entry.data, isStale: true, source: 'localStorage-stale' };
          }
          localStorage.removeItem(`roya_cache_${key}`);
        }
      }
    } catch (e) {
      console.warn('[CacheManager] LocalStorage read failed:', e);
    }

    return null;
  },

  /**
   * Set item in cache (Memory + LocalStorage)
   */
  set(key, data, ttlSeconds = DEFAULT_TTL_SECONDS) {
    const ttlMs = ttlSeconds * 1000;
    const expiry = Date.now() + ttlMs;
    const entry = { data, expiry, ttlMs, cachedAt: Date.now() };

    // Memory write
    MEMORY_CACHE.set(key, entry);

    // LocalStorage write
    try {
      localStorage.setItem(`roya_cache_${key}`, JSON.stringify(entry));
    } catch (e) {
      console.warn('[CacheManager] LocalStorage write failed (quota limit):', e);
      // If local storage is full, clear old cache entries
      this.clearExpired();
    }
  },

  /**
   * Remove a specific key
   */
  remove(key) {
    MEMORY_CACHE.delete(key);
    try {
      localStorage.removeItem(`roya_cache_${key}`);
    } catch (e) {
      // ignore
    }
  },

  /**
   * Clear expired entries from LocalStorage
   */
  clearExpired() {
    const now = Date.now();
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('roya_cache_')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const entry = JSON.parse(raw);
              if (now > entry.expiry + (entry.ttlMs || 1800000)) {
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (e) {
      console.warn('[CacheManager] Error clearing expired cache:', e);
    }
  },

  /**
   * Fetch helper with caching support and Stale-While-Revalidate
   */
  async cachedFetch(url, options = {}, ttlSeconds = DEFAULT_TTL_SECONDS) {
    const method = (options.method || 'GET').toUpperCase();
    const bodyStr = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : '';
    const isForceFresh = options.forceFresh || bodyStr.includes('"forceFresh":true') || ttlSeconds === 0;
    const cacheKey = `fetch_${method}_${url}_${bodyStr}`;

    if (!isForceFresh) {
      const cached = this.get(cacheKey);

      // Fresh hit - return instantly!
      if (cached && !cached.isStale) {
        return { data: cached.data, fromCache: true, cacheSource: cached.source };
      }

      // Stale hit - return stale data immediately and revalidate in background
      if (cached && cached.isStale) {
        // Trigger background revalidation fetch
        fetch(url, options)
          .then(res => res.json())
          .then(newData => {
            if (newData && (newData.success || newData.status === 'ok' || Array.isArray(newData))) {
              this.set(cacheKey, newData, ttlSeconds);
            }
          })
          .catch(err => console.warn('[CacheManager] Background revalidation failed:', err));

        return { data: cached.data, fromCache: true, cacheSource: 'stale-while-revalidate' };
      }
    } else {
      // Clear key if force fresh requested
      this.remove(cacheKey);
    }

    // Cache Miss or Force Fresh - perform network request
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data) {
      this.set(cacheKey, data, ttlSeconds > 0 ? ttlSeconds : DEFAULT_TTL_SECONDS);
    }

    return { data, fromCache: false, cacheSource: isForceFresh ? 'network-force-fresh' : 'network' };
  },

  /**
   * Returns metadata/stats about current cache
   */
  getStats() {
    let localStorageCount = 0;
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('roya_cache_')) localStorageCount++;
      });
    } catch (e) {}

    return {
      memoryEntries: MEMORY_CACHE.size,
      localStorageEntries: localStorageCount
    };
  }
};
