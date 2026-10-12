import { after } from "next/server";
import Pusher from "pusher";
import { LOBBY_CHANGED_EVENT, lobbyChannelName } from "./lobby-code";

// Realtime is an optimization over polling, so unlike Redis it is optional:
// without credentials no nudges are sent and clients keep polling.
function createPusher() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!appId || !key || !secret || !cluster) return null;

  return new Pusher({ appId, key, secret, cluster, useTLS: true });
}

const pusher = createPusher();

/**
 * Nudges every client in a lobby to refetch its state. The channel is public,
 * so the payload is only the version: lobby state differs per player (the spy
 * must never receive the location) and is always read through the API route.
 */
export function notifyLobbyChanged(code: string, version: number) {
  if (!pusher) return;

  // Sent after the response so a slow or failed nudge never affects the
  // mutation that caused it.
  after(async () => {
    try {
      await pusher.trigger(lobbyChannelName(code), LOBBY_CHANGED_EVENT, {
        v: version,
      });
    } catch (error) {
      console.error("notifyLobbyChanged error:", error);
    }
  });
}
