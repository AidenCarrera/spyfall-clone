"use client";

import { useState } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";
import { Eye, EyeOff, MapPin } from "lucide-react";
import {
  CardBack,
  CardDivider,
  PaperFace,
  SpyFace,
  cardTitleSize,
} from "@/components/cards/PlayingCard";
import { SpyMark } from "@/components/SpyMark";
import type { ClientLobbyState } from "@/lib/lobby-state";
import { cn } from "@/lib/ui";

interface RoleCardProps {
  lobby: ClientLobbyState;
  isRevealed: boolean;
  setIsRevealed: (revealed: boolean) => void;
}

const cardLabelClassName =
  "font-mono text-[max(0.6875rem,3.6cqw)] font-semibold uppercase tracking-[0.2em]";

function SpyCardFront() {
  return (
    <SpyFace>
      <div className="card-glint" />
      <div className="absolute inset-[11%] flex flex-col items-center justify-center text-center">
        <SpyMark className="w-[36%] text-crimson-500 drop-shadow-[0_0_6cqw_rgb(217_43_57/0.55)]" />
        <p className="mt-[4cqw] font-stencil text-[21cqw] font-black uppercase leading-[0.85] tracking-[0.04em] text-crimson-400">
          Spy
        </p>
        <CardDivider className="my-[6cqw] text-crimson-500" />
        <p className={cn(cardLabelClassName, "text-ink-300")}>Location</p>
        <p className="mt-[1.5cqw] font-display text-[11cqw] font-bold leading-none tracking-[0.25em] text-paper-100">
          ????
        </p>
      </div>
    </SpyFace>
  );
}

function LocationCardFront({
  role,
  location,
}: {
  role: string;
  location: string;
}) {
  return (
    <PaperFace>
      <div className="card-glint" />
      <div className="absolute inset-[11%] flex flex-col items-center justify-center text-center">
        <span className="flex aspect-square w-[20%] items-center justify-center rounded-full bg-crimson-600/10 text-crimson-600 ring-[0.6cqw] ring-crimson-600/25">
          <MapPin aria-hidden="true" className="w-1/2" strokeWidth={2.25} />
        </span>
        <p
          className={cn(
            cardTitleSize(role, "role"),
            "mt-[5cqw] text-balance font-display font-extrabold uppercase leading-[0.92] tracking-[0.02em] text-ink-900",
          )}
        >
          {role}
        </p>
        <CardDivider className="my-[6cqw] text-ink-900" />
        <p className={cn(cardLabelClassName, "text-paper-500")}>Location</p>
        <p
          className={cn(
            cardTitleSize(location, "location"),
            "mt-[1.5cqw] text-balance font-display font-bold uppercase leading-[0.95] tracking-[0.03em] text-crimson-700",
          )}
        >
          {location}
        </p>
      </div>
    </PaperFace>
  );
}

export function RoleCard({ lobby, isRevealed, setIsRevealed }: RoleCardProps) {
  const reduceMotion = useReducedMotion();
  // Keep face-up content mounted during flip animation
  const [isFaceUpMounted, setIsFaceUpMounted] = useState(isRevealed);
  const tiltX = useSpring(0, { stiffness: 180, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 180, damping: 18 });

  const reveal = () => {
    setIsFaceUpMounted(true);
    setIsRevealed(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(-y * 10);
    tiltY.set(x * 14);
  };

  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <section
      aria-labelledby="role-card-heading"
      className="flex flex-col items-center"
    >
      <h2 id="role-card-heading" className="eyebrow mb-4">
        Your Role
      </h2>

      <motion.div
        className="w-full max-w-[17rem] perspective-distant sm:max-w-[18.5rem]"
        initial={{ opacity: 0, y: -48, rotate: -8, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.1 }}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
      >
        <motion.div
          className="transform-3d"
          style={{ rotateX: tiltX, rotateY: tiltY }}
        >
          <motion.div
            className="relative aspect-[5/7] transform-3d"
            initial={false}
            animate={{ rotateY: isRevealed ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            onAnimationComplete={() => {
              if (!isRevealed) setIsFaceUpMounted(false);
            }}
          >
            <button
              type="button"
              onClick={reveal}
              inert={isRevealed}
              className="group absolute inset-0 rounded-[7%/5%] backface-hidden"
            >
              <CardBack className="transition-[filter] duration-200 group-hover:brightness-110">
                <span className="absolute inset-x-0 bottom-[11%] flex justify-center">
                  <span className="inline-flex animate-glow-pulse items-center gap-2 rounded-full bg-paper-100 px-4 py-2 font-display text-lg font-bold uppercase tracking-[0.08em] text-crimson-700 transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                    <Eye aria-hidden="true" className="size-5" />
                    Tap to Reveal Role
                  </span>
                </span>
              </CardBack>
            </button>

            <div
              inert={!isRevealed}
              aria-hidden={!isRevealed}
              className="absolute inset-0 rotate-y-180 backface-hidden"
            >
              {isFaceUpMounted &&
                (lobby.me.isSpy ? (
                  <SpyCardFront />
                ) : (
                  <LocationCardFront
                    role={lobby.me.role ?? ""}
                    location={lobby.location ?? ""}
                  />
                ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <button
        type="button"
        onClick={() => setIsRevealed(false)}
        inert={!isRevealed}
        className={cn(
          "mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink-400 underline-offset-4 transition-[color,opacity] duration-200 hover:text-ink-100 hover:underline",
          !isRevealed && "opacity-0",
        )}
      >
        <EyeOff aria-hidden="true" className="size-4" />
        Hide Role
      </button>
    </section>
  );
}
