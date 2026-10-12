"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { LOBBY_CHANGED_EVENT, lobbyChannelName } from "@/lib/lobby-code";

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

interface LobbyEventsOptions {
  code: string;
  enabled: boolean;
  /** Called with no arguments whenever the lobby may have changed. */
  onChange: () => void;
  /** Reports whether nudges are currently being received. */
  onConnectionChange: (isConnected: boolean) => void;
}

/**
 * Listens for "lobby changed" nudges. Both callbacks must be stable, since a
 * new identity reconnects. With realtime unconfigured or unreachable the
 * connection is never reported live, which leaves the caller polling.
 */
export function useLobbyEvents({
  code,
  enabled,
  onChange,
  onConnectionChange,
}: LobbyEventsOptions) {
  useEffect(() => {
    if (!enabled || !PUSHER_KEY || !PUSHER_CLUSTER) return;

    const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
    // Pusher passes the event payload to its handlers; `onChange` takes none.
    const notify = () => onChange();

    const channel = pusher.subscribe(lobbyChannelName(code));
    channel.bind(LOBBY_CHANGED_EVENT, notify);
    // Fires on every (re)subscribe, so this refetch also covers any nudges
    // missed before subscribing or while disconnected.
    channel.bind("pusher:subscription_succeeded", () => {
      onConnectionChange(true);
      notify();
    });
    pusher.connection.bind(
      "state_change",
      ({ current }: { current: string }) => {
        if (current !== "connected") onConnectionChange(false);
      },
    );

    return () => {
      pusher.disconnect();
      onConnectionChange(false);
    };
  }, [code, enabled, onChange, onConnectionChange]);
}
