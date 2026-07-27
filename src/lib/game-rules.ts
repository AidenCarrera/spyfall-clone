// Single source of truth for the rule limits enforced on the server and
// mirrored by the lobby UI. Node-free so client components can import it.

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;

export const MIN_SPIES = 1;
export const MAX_SPIES = 2;

export const MIN_TIMER_MINUTES = 1;
export const MAX_TIMER_MINUTES = 60;

export const DEFAULT_TIMER_MINUTES = 8;
export const DEFAULT_SPY_COUNT = MIN_SPIES;
