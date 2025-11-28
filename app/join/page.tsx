'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinLobbyAction } from '../actions';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import Link from 'next/link';

export default function JoinLobby() {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || !name.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await joinLobbyAction(code.trim(), name.trim());
            if (result.error) {
                setError(result.error);
            } else {
                sessionStorage.setItem(`spyfall_pid_${result.code}`, result.playerId!);
                router.push(`/lobby/${result.code}`);
            }
        } catch (err) {
            setError('Failed to join lobby');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950">
            <div className="w-full max-w-md">
                <div className="mb-8">
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                        ← Back to Home
                    </Link>
                </div>

                <Card title="Join Game">
                    <form onSubmit={handleJoin} className="space-y-6">
                        <Input
                            label="Room Code"
                            placeholder="Enter 6-character code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={8}
                        />

                        <Input
                            label="Your Name"
                            placeholder="Enter your display name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={error}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            disabled={isLoading}
                        >
                            {isLoading ? 'Joining...' : 'Join Game'}
                        </Button>
                    </form>
                </Card>
            </div>
        </main>
    );
}
