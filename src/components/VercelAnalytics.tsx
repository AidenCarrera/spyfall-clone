"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

function redactGameCode(event: BeforeSendEvent): BeforeSendEvent {
  const url = new URL(event.url);

  url.pathname = url.pathname.replace(
    /^\/lobby\/[^/]+(?=\/|$)/i,
    "/lobby/[code]",
  );
  url.searchParams.delete("code");

  return { ...event, url: url.toString() };
}

export function VercelAnalytics() {
  return <Analytics beforeSend={redactGameCode} />;
}
