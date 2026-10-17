import 'server-only';

// Best-effort sliding-window limiter. State lives in the function instance's
// memory, so on serverless it only throttles bursts that land on the same warm
// instance. Swap for a shared store (e.g. Upstash Redis) for a hard limit.
const buckets = new Map();

export function clientIp(request) {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}

export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}
