import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Create a new ratelimiter, that allows 5 requests per 60 seconds
export const createLobbyRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

// Create a new ratelimiter, that allows 10 requests per 60 seconds
export const joinLobbyRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export async function checkRateLimit(identifier: string, type: 'create' | 'join') {
  const limiter = type === 'create' ? createLobbyRatelimit : joinLobbyRatelimit;
  const { success } = await limiter.limit(identifier);
  return success;
}
