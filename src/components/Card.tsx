import React from "react";
import { cn } from "@/lib/ui";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  aside?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  icon,
  aside,
  style,
}) => {
  return (
    <div
      style={style}
      className={cn(
        "relative rounded-2xl border border-white/[0.08] bg-ink-850/90 p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_24px_48px_-24px_rgb(0_0_0/0.9)] before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent sm:p-6",
        className,
      )}
    >
      {title && (
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 font-display text-xl font-bold uppercase tracking-[0.06em] text-paper-100">
            {icon && (
              <span
                aria-hidden="true"
                className="flex size-7 items-center justify-center rounded-lg bg-brass-400/10 text-brass-400 ring-1 ring-brass-400/20 [&>svg]:size-4"
              >
                {icon}
              </span>
            )}
            {title}
          </h2>
          {aside}
        </div>
      )}
      {children}
    </div>
  );
};
