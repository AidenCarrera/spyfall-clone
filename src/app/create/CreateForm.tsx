"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { createLobbyAction } from "@/app/actions";
import { Button } from "@/components/Button";
import { FormScreen } from "@/components/FormScreen";
import { Input } from "@/components/Input";

export function CreateForm() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await createLobbyAction(name.trim());
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/lobby/${result.code}`);
      }
    } catch {
      setError("Failed to create lobby");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormScreen title="Create Game">
      <form onSubmit={handleCreate} className="mt-7 space-y-6">
        <Input
          label="Your Name"
          placeholder="Enter your display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          autoComplete="nickname"
          autoFocus
        />

        <Button type="submit" size="lg" fullWidth disabled={isLoading}>
          {isLoading && (
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          )}
          {isLoading ? "Creating..." : "Create Lobby"}
        </Button>
      </form>
    </FormScreen>
  );
}
