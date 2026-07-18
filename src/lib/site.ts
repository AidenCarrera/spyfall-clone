const configuredSiteUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();

export const SITE_URL = (
  configuredSiteUrl || "https://spyfall-clone.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Spyfall";

export const SITE_DESCRIPTION =
  "Play Spyfall online free with 3-12 friends. Create a private room, share the code, and find the spy—no account or download required.";
