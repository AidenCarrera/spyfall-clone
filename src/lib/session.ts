import { cookies } from "next/headers";
import { getSessionCookieName, hashSessionToken } from "./auth";

const SESSION_MAX_AGE_SECONDS = 86400;

export async function setSessionCookie(code: string, sessionToken: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: getSessionCookieName(code),
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteSessionCookie(code: string) {
  const cookieStore = await cookies();
  cookieStore.delete(getSessionCookieName(code));
}

export async function getSessionTokenHash(
  code: string,
): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName(code))?.value;
  return token ? hashSessionToken(token) : undefined;
}
