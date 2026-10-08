"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { joinLobbyAction } from "@/app/actions";
import { fetchLobbyState } from "@/lib/lobby-state";
import { Button } from "@/components/Button";
import { FormScreen } from "@/components/FormScreen";
import { Input } from "@/components/Input";
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
    <FormScreen title="Join Game">
      <form onSubmit={handleJoin} className="mt-7 space-y-6">
        {!normalizedUrlCode && (
          <Input
            label="Room Code"
            placeholder={`Enter ${LOBBY_CODE_LENGTH}-character code`}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={LOBBY_CODE_LENGTH}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            // Offset left padding to keep tracked text centered
            className="h-16 pl-[calc(1rem+0.4em)] text-center font-mono text-3xl font-bold tracking-[0.4em] text-brass-300 placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:tracking-normal"
          />
        )}

        <Input
          label="Your Name"
          placeholder="Enter your display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          autoComplete="nickname"
        />

        <Button type="submit" size="lg" fullWidth disabled={isLoading}>
          {isLoading && (
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          )}
          {isLoading ? "Joining..." : "Join Game"}
        </Button>
      </form>
    </FormScreen>
  );
}
