'use server';

import { store, Lobby, Player } from './lib/store';
import { z } from 'zod';

const CreateLobbySchema = z.object({
    hostName: z.string().trim().min(1, "Host name is required").max(20, "Host name must be 20 characters or less")
});

const JoinLobbySchema = z.object({
    code: z.string().trim().length(6, "Code must be 6 characters"),
    playerName: z.string().trim().min(1, "Player name is required").max(20, "Player name must be 20 characters or less")
});

export async function createLobbyAction(hostName: string) {
    try {
        const result = CreateLobbySchema.safeParse({ hostName });
        if (!result.success) {
            return { error: result.error.issues[0].message };
        }

        const lobby = await store.createLobby(result.data.hostName);
        // Return the host's player ID (it's the first player)
        return { code: lobby.code, playerId: lobby.players[0].id };
    } catch (error) {
        console.error('createLobbyAction error:', error);
        return { error: 'Failed to create lobby. Please try again.' };
    }
}

export async function joinLobbyAction(code: string, playerName: string) {
    try {
        const result = JoinLobbySchema.safeParse({ code, playerName });
        if (!result.success) {
            return { error: result.error.issues[0].message };
        }

        const joinResult = await store.joinLobby(result.data.code, result.data.playerName);
        if (joinResult.error) return { error: joinResult.error };
        return { code: joinResult.lobby!.code, playerId: joinResult.playerId };
    } catch (error) {
        console.error('joinLobbyAction error:', error);
        return { error: 'Failed to join lobby. Please check the code and try again.' };
    }
}

export async function leaveLobbyAction(code: string, playerId: string) {
    try {
        await store.leaveLobby(code, playerId);
        return { success: true };
    } catch (error) {
        console.error('leaveLobbyAction error:', error);
        return { error: 'Failed to leave lobby.' };
    }
}

export async function kickPlayerAction(code: string, playerId: string) {
    try {
        await store.kickPlayer(code, playerId);
        return { success: true };
    } catch (error) {
        console.error('kickPlayerAction error:', error);
        return { error: 'Failed to kick player.' };
    }
}

export async function startGameAction(code: string) {
    try {
        await store.startGame(code);
        return { success: true };
    } catch (error) {
        console.error('startGameAction error:', error);
        return { error: 'Failed to start game.' };
    }
}

export async function resetGameAction(code: string) {
    try {
        await store.resetGame(code);
        return { success: true };
    } catch (error) {
        console.error('resetGameAction error:', error);
        return { error: 'Failed to reset game.' };
    }
}

export async function promoteHostAction(code: string, newHostId: string) {
    try {
        await store.promoteHost(code, newHostId);
        return { success: true };
    } catch (error) {
        console.error('promoteHostAction error:', error);
        return { error: 'Failed to promote host.' };
    }
}

export async function updateSettingsAction(code: string, settings: { timerDuration?: number; spyCount?: number }) {
    try {
        await store.updateSettings(code, settings);
        return { success: true };
    } catch (error) {
        console.error('updateSettingsAction error:', error);
        return { error: 'Failed to update settings.' };
    }
}

export async function togglePauseAction(code: string) {
    try {
        await store.togglePause(code);
        return { success: true };
    } catch (error) {
        console.error('togglePauseAction error:', error);
        return { error: 'Failed to toggle pause.' };
    }
}

export interface ClientLobbyState {
    code: string;
    players: { name: string; isHost: boolean; id: string }[];
    status: string;
    me: Player | undefined;
    location?: string;
    timerStartTime?: number;
    timerAccumulated?: number;
    isPaused?: boolean;
    timerDuration?: number;
    spyCount?: number;
    isSpy?: boolean;
}

export async function getLobbyStateAction(code: string, playerId: string): Promise<{ lobby?: ClientLobbyState; error?: string }> {
    try {
        const lobby = await store.getLobby(code);
        if (!lobby) return { error: 'Lobby not found' };

        const me = lobby.players.find((p) => p.id === playerId);
        if (!me) return { error: 'Player not found in lobby' };

        // Sanitize data
        const clientLobby: ClientLobbyState = {
            code: lobby.code,
            players: lobby.players.map(p => ({ name: p.name, isHost: p.isHost, id: p.id })),
            status: lobby.status,
            me: me,
            timerStartTime: lobby.timerStartTime,
            timerAccumulated: lobby.timerAccumulated,
            isPaused: lobby.isPaused,
            timerDuration: lobby.settings.timerDuration,
            spyCount: lobby.settings.spyCount,
        };

        if (lobby.status === 'IN_PROGRESS') {
            if (me.isSpy) {
                clientLobby.isSpy = true;
            } else {
                clientLobby.isSpy = false;
                clientLobby.location = lobby.location;
            }
        }

        return { lobby: clientLobby };
    } catch (error) {
        console.error('getLobbyStateAction error:', error);
        return { error: 'Failed to fetch lobby state.' };
    }
}
