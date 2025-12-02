"use client";

import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { ClientLobbyState } from "@/app/actions";

interface RoleCardProps {
  lobby: ClientLobbyState;
  isRevealed: boolean;
  setIsRevealed: (revealed: boolean) => void;
}

export function RoleCard({ lobby, isRevealed, setIsRevealed }: RoleCardProps) {
  return (
    <Card className="text-center space-y-4 border-blue-500/30 shadow-blue-900/20">
      <div className="space-y-1">
        <p className="text-slate-400 text-sm uppercase tracking-wider">
          Your Role
        </p>

        {isRevealed ? (
          <div>
            <div className="space-y-2 bg-linear-to-b from-slate-800/50 to-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <p className="text-3xl font-bold text-white">
                {lobby.isSpy ? "Spy" : lobby.me?.role}
              </p>
              <div className="pt-2 border-t border-slate-700/50 mt-2">
                <p className="text-slate-400 text-xs uppercase">Location</p>
                <p className="text-2xl font-bold text-blue-400">
                  {lobby.isSpy ? "????" : lobby.location}
                </p>
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
  );
}
