'use server';

import { store, Lobby, Player } from './lib/store';

export async function createLobbyAction(hostName: string) {
    try {
        if (!hostName) return { error: 'Host name is required' };
        const lobby = await store.createLobby(hostName);
        // Return the host's player ID (it's the first player)
        return { code: lobby.code, playerId: lobby.players[0].id };
    } catch (error) {
        console.error('createLobbyAction error:', error);
        return { error: 'Failed to create lobby. Please try again.' };
    }
}

export async function joinLobbyAction(code: string, playerName: string) {
    try {
        if (!code || !playerName) return { error: 'Code and name are required' };
        const result = await store.joinLobby(code, playerName);
        if (result.error) return { error: result.error };
        return { code: result.lobby!.code, playerId: result.playerId };
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

// Sanitized lobby type for frontend
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
                // Spy doesn't see location
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
