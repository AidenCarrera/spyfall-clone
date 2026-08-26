const configuredSiteUrl = process.env.SITE_URL?.trim();

export const SITE_URL = (
  configuredSiteUrl || "https://spyfall.aidencarrera.com"
).replace(/\/$/, "");

export const SITE_NAME = "Spyfall";

export const SITE_DESCRIPTION =
  "Play Spyfall online free with 3-12 friends. Create a private room, share the code, and find the spy—no account or download required.";
