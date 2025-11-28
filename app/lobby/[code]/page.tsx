'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getLobbyStateAction, startGameAction, leaveLobbyAction, resetGameAction, togglePauseAction, promoteHostAction, updateSettingsAction, ClientLobbyState } from '../../actions';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import gameData from '../../lib/game-data.json';

// Polling interval in ms
const POLLING_INTERVAL = 2000;

export default function LobbyPage({ params }: { params: Promise<{ code: string }> }) {
    const resolvedParams = use(params);
    const code = resolvedParams.code;
    const router = useRouter();

    const [lobby, setLobby] = useState<ClientLobbyState | null>(null);
    const [error, setError] = useState('');
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [loading, setLoading] = useState(true);

    // Timer state
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isTimeUp, setIsTimeUp] = useState(false);

    // Initial setup and polling
    useEffect(() => {
        // Get playerId from storage
        const storedPid = sessionStorage.getItem(`spyfall_pid_${code}`);
        if (!storedPid) {
            router.push(`/join?code=${code}`);
            return;
        }
        setPlayerId(storedPid);

        const fetchLobby = async () => {
            const result = await getLobbyStateAction(code, storedPid);
            if (result.error) {
                setError(result.error);
                if (result.error === 'Lobby not found') {
                    router.push('/');
                }
            } else {
                setLobby(result.lobby!);
            }
            setLoading(false);
        };

        fetchLobby();
        const interval = setInterval(fetchLobby, POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, [code, router]);

    // Role visibility reset
    useEffect(() => {
        if (lobby?.status === 'LOBBY') {
            setIsRevealed(false);
        }
    }, [lobby?.status]);

    // Timer logic
    useEffect(() => {
        if (lobby?.status !== 'IN_PROGRESS' || !lobby?.timerDuration) {
            setTimeLeft('');
            setIsTimeUp(false);
            return;
        }

        const updateTimer = () => {
            const totalDurationMs = lobby.timerDuration! * 60 * 1000;
            let elapsed = lobby.timerAccumulated || 0;

            if (!lobby.isPaused && lobby.timerStartTime) {
                elapsed += (Date.now() - lobby.timerStartTime);
            }

            const remaining = totalDurationMs - elapsed;

            if (remaining <= 0) {
                setTimeLeft('00:00');
                setIsTimeUp(true);
            } else {
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                setIsTimeUp(false);
            }
        };

        updateTimer(); // Initial update
        const timerInterval = setInterval(updateTimer, 1000);
        return () => clearInterval(timerInterval);
    }, [lobby?.status, lobby?.timerStartTime, lobby?.timerAccumulated, lobby?.isPaused, lobby?.timerDuration]);

    const handleStartGame = async () => {
        setIsRevealed(false);
        await startGameAction(code);
    };

    const handleLeave = async () => {
        if (playerId) {
            await leaveLobbyAction(code, playerId);
            sessionStorage.removeItem(`spyfall_pid_${code}`);
            router.push('/');
        }
    };

    const handleReset = async () => {
        setIsRevealed(false);
        await resetGameAction(code);
    };

    const handleTogglePause = async () => {
        if (!lobby) return;

        // Optimistic update
        const now = Date.now();
        const newIsPaused = !lobby.isPaused;

        const updatedLobby = { ...lobby, isPaused: newIsPaused };

        if (newIsPaused) {
            // Pausing
            const currentSegment = lobby.timerStartTime ? (now - lobby.timerStartTime) : 0;
            updatedLobby.timerAccumulated = (lobby.timerAccumulated || 0) + currentSegment;
            updatedLobby.timerStartTime = undefined;
        } else {
            // Resuming
            updatedLobby.timerStartTime = now;
        }

        setLobby(updatedLobby);
        await togglePauseAction(code);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <Card title="Error">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button onClick={() => router.push('/')}>Go Home</Button>
                </Card>
            </div>
        );
    }

    if (!lobby) return null;

    const isHost = lobby.me?.isHost;

    // LOBBY VIEW
    if (lobby.status === 'LOBBY') {
        return (
            <main className="min-h-screen p-4 bg-slate-950 text-white">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Lobby</h1>
                        <Button variant="outline" onClick={handleLeave} className="text-sm px-3 py-1">
                            Leave
                        </Button>
                    </div>

                    <Card className="text-center space-y-2">
                        <p className="text-slate-400 text-sm uppercase tracking-wider">Access Code</p>
                        <p className="text-5xl font-mono font-bold text-blue-400 tracking-widest">{code}</p>
                    </Card>

                    <Card title="Game Settings">
                        <div className="flex items-center justify-between">
                            <label className="text-slate-300">Timer Duration (mins)</label>
                            {isHost ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const newDuration = Math.max(1, (lobby.timerDuration || 8) - 1);
                                            updateSettingsAction(code, { timerDuration: newDuration });
                                            // Optimistic update
                                            setLobby(prev => prev ? ({ ...prev, timerDuration: newDuration }) : null);
                                        }}
                                        className="w-8 h-8 bg-slate-700 rounded hover:bg-slate-600 flex items-center justify-center text-xl font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-mono text-xl">{lobby.timerDuration || 8}</span>
                                    <button
                                        onClick={() => {
                                            const newDuration = Math.min(60, (lobby.timerDuration || 8) + 1);
                                            updateSettingsAction(code, { timerDuration: newDuration });
                                            // Optimistic update
                                            setLobby(prev => prev ? ({ ...prev, timerDuration: newDuration }) : null);
                                        }}
                                        className="w-8 h-8 bg-slate-700 rounded hover:bg-slate-600 flex items-center justify-center text-xl font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <span className="font-mono text-xl text-blue-400">{lobby.timerDuration || 8} min</span>
                            )}
                        </div>
                    </Card>

                    <Card title={`Players (${lobby.players.length})`}>
                        <ul className="space-y-2">
                            {lobby.players.map((p) => (
                                <li key={p.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className={p.id === playerId ? "font-bold text-blue-300" : ""}>
                                            {p.name} {p.id === playerId && "(You)"}
                                        </span>
                                        {p.isHost && (
                                            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">HOST</span>
                                        )}
                                    </div>
                                    {isHost && !p.isHost && (
                                        <button
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to make ${p.name} the host? You will lose host privileges.`)) {
                                                    promoteHostAction(code, p.id);
                                                }
                                            }}
                                            className="text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 px-2 py-1 rounded transition-colors"
                                        >
                                            Make Host
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {isHost ? (
                        <Button fullWidth onClick={handleStartGame} disabled={lobby.players.length < 3}>
                            Start Game {lobby.players.length < 3 && "(Need 3+ players)"}
                        </Button>
                    ) : (
                        <p className="text-center text-slate-500 animate-pulse">Waiting for host to start...</p>
                    )}
                </div>
            </main>
        );
    }

    // GAME VIEW
    return (
        <main className="min-h-screen p-4 bg-slate-950 text-white">
            <div className="max-w-md mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-400 flex items-center gap-2">
                        <span>Game in progress</span>
                        {timeLeft && (
                            <span className={`font-mono font-bold ${isTimeUp ? 'text-red-500 animate-pulse' : lobby.isPaused ? 'text-yellow-400' : 'text-blue-400'}`}>
                                {isTimeUp ? "TIME'S UP!" : timeLeft} {lobby.isPaused && "(PAUSED)"}
                            </span>
                        )}
                    </div>
                    {isHost && (
                        <div className="flex gap-2">
                            {!isTimeUp && (
                                <Button variant="secondary" onClick={handleTogglePause} className="text-xs px-2 py-1">
                                    {lobby.isPaused ? "Resume" : "Pause"}
                                </Button>
                            )}
                            <Button variant="danger" onClick={handleReset} className="text-xs px-2 py-1">
                                End Game
                            </Button>
                        </div>
                    )}
                </div>

                <Card className="text-center space-y-4 border-blue-500/30 shadow-blue-900/20">
                    <div className="space-y-1">
                        <p className="text-slate-400 text-sm uppercase tracking-wider">Your Role</p>

                        {isRevealed ? (
                            <div>
                                <div className="space-y-2">
                                    <p className="text-3xl font-bold text-white">{lobby.isSpy ? "Spy" : lobby.me?.role}</p>
                                    <div className="pt-2 border-t border-slate-700 mt-2">
                                        <p className="text-slate-400 text-xs uppercase">Location</p>
                                        <p className="text-2xl font-bold text-blue-400">{lobby.isSpy ? "????" : lobby.location}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8">
                                <Button onClick={() => setIsRevealed(true)} variant="primary">
                                    Tap to Reveal Role
                                </Button>
                            </div>
                        )}
                    </div>

                    {isRevealed && (
                        <button
                            onClick={() => setIsRevealed(false)}
                            className="text-xs text-slate-500 hover:text-slate-300 underline"
                        >
                            Hide Role
                        </button>
                    )}
                </Card>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-300 px-1">Locations Reference</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {gameData.spyfall1.map((loc) => (
                            <div
                                key={loc.location}
                                className={`p-2 rounded text-sm text-center transition-colors cursor-pointer select-none
                            ${lobby.location === loc.location && isRevealed && !lobby.isSpy
                                        ? "bg-blue-900/30 text-blue-200 border border-blue-500/30"
                                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                    }`}
                                onClick={(e) => {
                                    // Simple toggle for crossing off
                                    e.currentTarget.classList.toggle('line-through');
                                }}
                            >
                                {loc.location}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
