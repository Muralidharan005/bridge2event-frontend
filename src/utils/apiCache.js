/**
 * In-Memory API Cache for Bridge2Event Frontend
 * Provides instantaneous page transitions, request deduplication, and TTL expiration.
 */

class ApiCache {
  constructor() {
    this.cache = new Map();
    this.inFlight = new Map();
    this.defaultTtl = 3 * 60 * 1000; // 3 minutes default TTL
  }

  /**
   * Generate a stable, normalized cache key from prefix and query params.
   */
  makeKey(prefix, params = {}) {
    if (!params || typeof params !== "object" || Object.keys(params).length === 0) {
      return prefix;
    }
    const sortedKeys = Object.keys(params).sort();
    const query = sortedKeys
      .map((k) => `${k}=${encodeURIComponent(params[k] !== undefined && params[k] !== null ? params[k] : "")}`)
      .join("&");
    return `${prefix}?${query}`;
  }

  /**
   * Get unexpired cached data.
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Put data into cache with a specific TTL.
   */
  set(key, data, ttl = this.defaultTtl) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Check if a valid, unexpired entry exists.
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Invalidate all keys matching a given prefix.
   */
  invalidate(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all event-related caches.
   */
  invalidateEvents() {
    this.invalidate("events");
  }

  /**
   * Clear entire cache.
   */
  clear() {
    this.cache.clear();
    this.inFlight.clear();
  }

  /**
   * Fetch with cache and deduplicate in-flight promises.
   */
  async fetch(key, fetcherFn, options = {}) {
    const ttl = options.ttl || this.defaultTtl;
    const force = options.force || false;

    // 1. If not forcing fresh data, return valid cached data immediately
    if (!force) {
      const cached = this.get(key);
      if (cached !== null) {
        return { data: cached, fromCache: true };
      }
    }

    // 2. Return pending promise if an identical request is already running
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key);
    }

    // 3. Run the network request and save to cache
    const promise = (async () => {
      try {
        const response = await fetcherFn();
        if (response && response.data !== undefined) {
          this.set(key, response.data, ttl);
        }
        return response;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }
}

export const apiCache = new ApiCache();
