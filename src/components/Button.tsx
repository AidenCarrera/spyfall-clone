import React from "react";
import { cn } from "@/lib/ui";

export type ButtonVariant =
  "primary" | "secondary" | "danger" | "outline" | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const baseStyles =
  "relative inline-flex select-none items-center justify-center whitespace-nowrap font-display font-bold uppercase tracking-[0.08em] transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-45 disabled:saturate-50";

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3.5 text-[0.95rem]",
  md: "h-12 gap-2 rounded-xl px-6 text-lg",
  lg: "h-14 gap-2.5 rounded-xl px-7 text-xl",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-linear-to-b from-crimson-500 to-crimson-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_4px_0_var(--color-crimson-800),0_10px_20px_-12px_rgb(217_43_57/0.35)] hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_5px_0_var(--color-crimson-800),0_12px_24px_-12px_rgb(217_43_57/0.45)] active:translate-y-[3px] active:shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_1px_0_var(--color-crimson-800),0_4px_10px_-8px_rgb(217_43_57/0.3)]",
  secondary:
    "border border-white/10 bg-linear-to-b from-ink-700 to-ink-800 text-paper-100 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_4px_0_var(--color-ink-950)] hover:-translate-y-px hover:border-white/20 hover:from-ink-600 hover:to-ink-700 active:translate-y-[3px] active:shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_1px_0_var(--color-ink-950)]",
  danger:
    "border border-crimson-400/35 bg-crimson-500/12 text-crimson-300 hover:border-crimson-400/60 hover:bg-crimson-500/22 hover:text-crimson-200 active:translate-y-px",
  outline:
    "border border-ink-500 bg-transparent text-ink-200 hover:border-ink-400 hover:bg-white/[0.04] hover:text-white active:translate-y-px",
  ghost:
    "bg-transparent text-ink-300 hover:bg-white/[0.06] hover:text-paper-50 active:translate-y-px",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    baseStyles,
    sizes[size],
    variants[variant],
    fullWidth && "w-full",
    className,
  );
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth, className })}
      aria-label={
        props["aria-label"] ||
        (typeof children === "string" ? children : undefined)
      }
      {...props}
    >
      {children}
    </button>
  );
};
