// Lobby-code helpers shared by server actions, the Redis store, and client
// routes. Kept free of Node-only imports so client components can use it.

export const LOBBY_CODE_LENGTH = 6;

export const LOBBY_CODE_PATTERN = new RegExp(
  `^[A-Z0-9]{${LOBBY_CODE_LENGTH}}$`,
);

const LOBBY_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function normalizeLobbyCode(code: string): string {
  return code.trim().toUpperCase();
}

export function generateLobbyCode(): string {
  let code = "";
  for (let i = 0; i < LOBBY_CODE_LENGTH; i++) {
    code += LOBBY_CODE_ALPHABET.charAt(
      Math.floor(Math.random() * LOBBY_CODE_ALPHABET.length),
    );
  }
  return code;
}
