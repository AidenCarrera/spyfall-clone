import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-6 py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100",
    danger:
      "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20",
    outline:
      "border-2 border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white bg-transparent",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${width} ${className}`}
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
