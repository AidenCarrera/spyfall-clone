'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLobbyAction } from '../actions';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import Link from 'next/link';

export default function CreateLobby() {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await createLobbyAction(name);
            if (result.error) {
                setError(result.error);
            } else {
                // Store playerId in localStorage or cookie if needed, but for now we'll pass it via URL or state?
                // Actually, passing via URL is risky/ugly. Better to store in sessionStorage or a cookie.
                // For simplicity in this clone, let's append it to the URL hash or query param temporarily, 
                // or better yet, use sessionStorage since it's a SPA feel.
                sessionStorage.setItem(`spyfall_pid_${result.code}`, result.playerId!);
                router.push(`/lobby/${result.code}`);
            }
        } catch (err) {
            setError('Failed to create lobby');
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

                <Card title="Create Game">
                    <form onSubmit={handleCreate} className="space-y-6">
                        <Input
                            label="Your Name"
                            placeholder="Enter your display name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={error}
                            autoFocus
                        />

                        <Button
                            type="submit"
                            fullWidth
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create Lobby'}
                        </Button>
                    </form>
                </Card>
            </div>
        </main>
    );
}
