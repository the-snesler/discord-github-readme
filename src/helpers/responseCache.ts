import LRUCacheWithDelete from "mnemonist/lru-cache-with-delete";
import type { Request, RequestHandler } from "express";

export interface CachedResponse {
  body: string;
  contentType: string;
  status: number;
  createdAt: number;
}

const DEFAULT_MAX_ENTRIES = 5000;
const DEFAULT_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const KEY_SEP = "::";

const parseEnvInt = (raw: string | undefined, fallback: number) => {
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const MAX_ENTRIES = parseEnvInt(process.env.RESPONSE_CACHE_MAX, DEFAULT_MAX_ENTRIES);
const MAX_AGE_MS = parseEnvInt(process.env.RESPONSE_CACHE_MAX_AGE_MS, DEFAULT_MAX_AGE_MS);

const entries = new LRUCacheWithDelete<string, CachedResponse>(MAX_ENTRIES);
const byUser = new Map<string, Set<string>>();

const compositeKey = (userId: string, variantKey: string) => `${userId}${KEY_SEP}${variantKey}`;
const userIdFromKey = (key: string) => key.slice(0, key.indexOf(KEY_SEP));

const detachFromUser = (key: string) => {
  const uid = userIdFromKey(key);
  const set = byUser.get(uid);
  if (!set) return;
  set.delete(key);
  if (set.size === 0) byUser.delete(uid);
};

export const responseCache = {
  get(userId: string, variantKey: string): CachedResponse | undefined {
    const key = compositeKey(userId, variantKey);
    const hit = entries.get(key);
    if (!hit) return undefined;
    if (Date.now() - hit.createdAt > MAX_AGE_MS) {
      entries.delete(key);
      detachFromUser(key);
      return undefined;
    }
    return hit;
  },

  set(userId: string, variantKey: string, entry: CachedResponse): void {
    const key = compositeKey(userId, variantKey);
    const result = entries.setpop(key, entry);
    // result === null  => fresh insert with room to spare
    // result.evicted === false => key already existed; reverse index already tracks it
    // result.evicted === true  => a different LRU entry was popped to make room
    if (result && result.evicted) {
      detachFromUser(result.key);
    }
    let set = byUser.get(userId);
    if (!set) {
      set = new Set();
      byUser.set(userId, set);
    }
    set.add(key);
  },

  invalidateUser(userId: string): number {
    const set = byUser.get(userId);
    if (!set) return 0;
    let removed = 0;
    for (const key of set) {
      if (entries.delete(key)) removed++;
    }
    byUser.delete(userId);
    return removed;
  },

  // Test/debug helpers
  _stats() {
    return { entries: entries.size, users: byUser.size, capacity: MAX_ENTRIES };
  },
  _clear() {
    entries.clear();
    byUser.clear();
  },
};

const canonicalVariantKey = (req: Request): string => {
  const keys = Object.keys(req.query).sort();
  const parts: string[] = [];
  for (const k of keys) {
    const v = req.query[k];
    parts.push(`${k}=${Array.isArray(v) ? v.join(",") : String(v)}`);
  }
  return `${req.path}?${parts.join("&")}`;
};

export interface CacheWrapOptions {
  userIdFor: (req: Request) => string | null | Promise<string | null>;
}

export const withResponseCache = (
  handler: RequestHandler,
  options: CacheWrapOptions
): RequestHandler => {
  return async (req, res, next) => {
    let userId: string | null;
    try {
      userId = await options.userIdFor(req);
    } catch {
      userId = null;
    }
    if (!userId) {
      return handler(req, res, next);
    }
    const variantKey = canonicalVariantKey(req);
    const hit = responseCache.get(userId, variantKey);
    if (hit) {
      res.set("X-Cache", "HIT");
      res.set("Content-Type", hit.contentType);
      res.status(hit.status).send(hit.body);
      return;
    }
    res.set("X-Cache", "MISS");
    const originalSend = res.send.bind(res);
    res.send = function (body: unknown) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const serialized =
          typeof body === "string"
            ? body
            : Buffer.isBuffer(body)
              ? body.toString("utf8")
              : JSON.stringify(body);
        responseCache.set(userId!, variantKey, {
          body: serialized,
          contentType: (res.get("Content-Type") as string) || "text/plain",
          status: res.statusCode,
          createdAt: Date.now(),
        });
      }
      return originalSend(body);
    };
    return handler(req, res, next);
  };
};
