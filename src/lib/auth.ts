import { createHash, randomBytes } from "node:crypto";

const SESSION_COOKIE_PREFIX = "spyfall_session_";

export function normalizeLobbyCode(code: string): string {
  return code.trim().toUpperCase();
}

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionCookieName(code: string): string {
  return `${SESSION_COOKIE_PREFIX}${normalizeLobbyCode(code)}`;
}
