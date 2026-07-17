import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Separate policies keep lobby creation from consuming join capacity.
const createLobbyRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "rl:create",
});

const joinLobbyRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "rl:join",
});

export async function checkRateLimit(
  identifier: string,
  type: "create" | "join",
) {
  const limiter = type === "create" ? createLobbyRatelimit : joinLobbyRatelimit;
  const { success } = await limiter.limit(identifier);
  return success;
}
