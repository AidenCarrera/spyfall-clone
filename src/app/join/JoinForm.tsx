"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { joinLobbyAction } from "@/app/actions";
import { fetchLobbyState } from "@/lib/lobby-state";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import Link from "next/link";
import { LOBBY_CODE_LENGTH, normalizeLobbyCode } from "@/lib/lobby-code";

export function JoinForm() {
  const searchParams = useSearchParams();
  const urlCode = searchParams.get("code");

  const normalizedUrlCode = normalizeLobbyCode(urlCode ?? "");
  const [code, setCode] = useState(normalizedUrlCode);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!normalizedUrlCode) return;

    let isCancelled = false;
    fetchLobbyState(normalizedUrlCode)
      .then((result) => {
        if (!isCancelled && result.lobby) {
          router.replace(`/lobby/${result.lobby.code}`);
        }
      })
      // No existing session for this code; fall through to the join form.
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [normalizedUrlCode, router]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const submittedCode = normalizedUrlCode || normalizeLobbyCode(code);
    if (!submittedCode || !name.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await joinLobbyAction(submittedCode, name.trim());
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/lobby/${result.code}`);
      }
    } catch {
      setError("Failed to join lobby");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-linear-to-b from-slate-900 to-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Home
          </Link>
        </div>

        <Card>
          <h1 className="mb-4 text-xl font-bold text-white">Join Game</h1>
          <form onSubmit={handleJoin} className="space-y-6">
            {!normalizedUrlCode && (
              <Input
                label="Room Code"
                placeholder={`Enter ${LOBBY_CODE_LENGTH}-character code`}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={LOBBY_CODE_LENGTH}
                autoCapitalize="characters"
                spellCheck={false}
              />
            )}

            <Input
              label="Your Name"
              placeholder="Enter your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={error}
            />

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? "Joining..." : "Join Game"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
