import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOBBY_CODE_PATTERN, normalizeLobbyCode } from "@/lib/lobby-code";

// Normalizes lobby-code casing before a route renders, so `/lobby/abc123` and
// `/lobby/ABC123` resolve to one canonical URL rather than two cache entries.
// Only pure constants are imported here; the proxy runs separately from the
// render path and must not share runtime state with the app.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const code = pathname.slice("/lobby/".length);
  const normalizedCode = normalizeLobbyCode(code);

  if (code === normalizedCode || !LOBBY_CODE_PATTERN.test(normalizedCode)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/lobby/${normalizedCode}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/lobby/:code",
};
