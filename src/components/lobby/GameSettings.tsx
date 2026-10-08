"use client";

import { useId, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  MapPinned,
  Minus,
  Plus,
  Settings,
  SlidersHorizontal,
  Timer,
} from "lucide-react";
import type { KeyedMutator } from "swr";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { EditLocationsModal } from "@/components/EditLocationsModal";
import { SpyMark } from "@/components/SpyMark";
import { updateSettingsAction } from "@/app/actions";
import type { ClientLobbyState, LobbyStateResponse } from "@/lib/lobby-state";
import {
  MAX_SPIES,
  MAX_TIMER_MINUTES,
  MIN_SPIES,
  MIN_TIMER_MINUTES,
} from "@/lib/game-rules";
import { cn } from "@/lib/ui";

const SPY_COUNT_OPTIONS = Array.from(
  { length: MAX_SPIES - MIN_SPIES + 1 },
  (_, index) => MIN_SPIES + index,
);

function spyCountLabel(count: number) {
  return `${count} ${count === 1 ? "spy" : "spies"}`;
}

function SpyIcons({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: count }, (_, index) => (
        <SpyMark key={index} className="size-6" />
      ))}
    </span>
  );
}

function SettingRow({
  labelId,
  label,
  icon,
  children,
}: {
  labelId: string;
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 py-3 first:pt-0">
      <span
        id={labelId}
        className="flex items-center gap-2.5 text-[0.95rem] font-medium text-ink-200"
      >
        <span
          aria-hidden="true"
          className="hidden text-ink-400 sm:flex [&>*]:size-4"
        >
          {icon}
        </span>
        {label}
      </span>
      {children}
    </div>
  );
}

const stepperButtonClassName =
  "flex size-8 sm:size-9 items-center justify-center rounded-lg text-ink-200 transition-[background-color,color,transform] duration-150 hover:bg-white/[0.08] hover:text-white active:scale-90 disabled:pointer-events-none disabled:opacity-35";

interface GameSettingsProps {
  lobby: ClientLobbyState;
  mutate: KeyedMutator<LobbyStateResponse>;
}

export function GameSettings({ lobby, mutate }: GameSettingsProps) {
  const [isEditLocationsOpen, setIsEditLocationsOpen] = useState(false);
  const idPrefix = useId();
  const isHost = lobby.me.isHost;
  const updateSettings = async (
    settings: Parameters<typeof updateSettingsAction>[1],
  ) => {
    await mutate(
      (current) =>
        current?.lobby
          ? {
              ...current,
              lobby: { ...current.lobby, ...settings },
            }
          : current,
      { revalidate: false },
    );
    await updateSettingsAction(lobby.code, settings);
    await mutate();
  };

  const timerLabelId = `${idPrefix}-timer`;
  const spiesLabelId = `${idPrefix}-spies`;

  return (
    <Card title="Game Settings" icon={<SlidersHorizontal />}>
      <div className="divide-y divide-white/[0.06]">
        <SettingRow
          labelId={timerLabelId}
          label="Timer Duration (mins)"
          icon={<Timer />}
        >
          {isHost ? (
            <div
              role="group"
              aria-labelledby={timerLabelId}
              className="flex shrink-0 items-center rounded-xl border border-white/10 bg-ink-950/60 p-1 shadow-[inset_0_2px_6px_rgb(0_0_0/0.4)]"
            >
              <button
                type="button"
                aria-label="Decrease timer"
                disabled={lobby.timerDuration <= MIN_TIMER_MINUTES}
                onClick={() =>
                  updateSettings({
                    timerDuration: Math.max(
                      MIN_TIMER_MINUTES,
                      lobby.timerDuration - 1,
                    ),
                  })
                }
                className={stepperButtonClassName}
              >
                <Minus aria-hidden="true" className="size-4" strokeWidth={3} />
              </button>
              <span
                aria-live="polite"
                className="w-9 overflow-hidden text-center sm:w-11 font-mono text-xl font-bold tabular-nums text-brass-300"
              >
                <motion.span
                  key={lobby.timerDuration}
                  className="inline-block"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 26 }}
                >
                  {lobby.timerDuration}
                </motion.span>
              </span>
              <button
                type="button"
                aria-label="Increase timer"
                disabled={lobby.timerDuration >= MAX_TIMER_MINUTES}
                onClick={() =>
                  updateSettings({
                    timerDuration: Math.min(
                      MAX_TIMER_MINUTES,
                      lobby.timerDuration + 1,
                    ),
                  })
                }
                className={stepperButtonClassName}
              >
                <Plus aria-hidden="true" className="size-4" strokeWidth={3} />
              </button>
            </div>
          ) : (
            <span className="font-mono text-xl font-bold tabular-nums text-brass-300">
              {lobby.timerDuration} min
            </span>
          )}
        </SettingRow>

        <SettingRow labelId={spiesLabelId} label="Spies" icon={<SpyMark />}>
          {isHost ? (
            <div
              role="group"
              aria-labelledby={spiesLabelId}
              className="flex shrink-0 items-center gap-2"
            >
              {SPY_COUNT_OPTIONS.map((count) => {
                const isSelected = lobby.spyCount === count;
                return (
                  <button
                    type="button"
                    key={count}
                    onClick={() => updateSettings({ spyCount: count })}
                    aria-pressed={isSelected}
                    aria-label={spyCountLabel(count)}
                    className={cn(
                      "flex h-11 items-center gap-2.5 rounded-xl border px-3 transition-[background-color,border-color,color,box-shadow,transform] duration-200 active:scale-95",
                      isSelected
                        ? "border-crimson-400/60 bg-crimson-500/15 text-crimson-400 shadow-[0_0_0_3px_rgb(217_43_57/0.12)]"
                        : "border-white/12 bg-ink-950/40 text-ink-400 hover:border-white/20 hover:text-ink-200",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-3.5 items-center justify-center rounded-full border-2 transition-colors",
                        isSelected ? "border-crimson-400" : "border-ink-400",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full bg-crimson-400 transition-transform duration-200",
                          isSelected ? "scale-100" : "scale-0",
                        )}
                      />
                    </span>
                    <SpyIcons count={count} />
                  </button>
                );
              })}
            </div>
          ) : (
            <span
              role="img"
              aria-label={spyCountLabel(lobby.spyCount)}
              className="px-2 py-1 text-crimson-400"
            >
              <SpyIcons count={lobby.spyCount} />
            </span>
          )}
        </SettingRow>

        <div className="flex flex-col gap-3 pt-3">
          <div className="flex min-h-11 items-center justify-between gap-4">
            <span className="flex items-center gap-2.5 text-[0.95rem] font-medium text-ink-200">
              <MapPinned
                aria-hidden="true"
                className="hidden size-4 text-ink-400 sm:block"
              />
              Locations
            </span>
            <span
              className={cn(
                "font-mono tabular-nums text-brass-300",
                isHost
                  ? "rounded-full border border-brass-400/25 bg-brass-400/10 px-2.5 py-0.5 text-xs font-semibold"
                  : "text-xl font-bold",
              )}
            >
              {lobby.selectedLocations.length} selected
            </span>
          </div>

          {isHost && (
            <>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setIsEditLocationsOpen(true)}
              >
                <Settings aria-hidden="true" className="size-4" />
                Edit Locations
              </Button>

              <EditLocationsModal
                isOpen={isEditLocationsOpen}
                onClose={() => setIsEditLocationsOpen(false)}
                selectedLocations={lobby.selectedLocations}
                onUpdate={(selectedLocations) =>
                  updateSettings({ selectedLocations })
                }
              />
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
