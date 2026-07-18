import React from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20",
  secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100",
  danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20",
  outline:
    "border-2 border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white bg-transparent",
};

export function buttonClassName({
  variant = "primary",
  fullWidth = false,
  className = "",
}: {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return `${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}) => {
  return (
    <button
      className={buttonClassName({ variant, fullWidth, className })}
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
