import React from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/ui";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  ...props
}) => {
  const generatedId = React.useId();
  const inputId = id || props.name || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="eyebrow mb-2 block">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-13 w-full rounded-xl border bg-ink-950/70 px-4 text-base text-paper-50 shadow-[inset_0_2px_6px_rgb(0_0_0/0.45)] outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-ink-400 hover:border-ink-500 focus:border-brass-400/80 focus:bg-ink-950 focus:shadow-[inset_0_2px_6px_rgb(0_0_0/0.45),0_0_0_4px_rgb(245_195_91/0.14)] focus-visible:outline-none",
          error ? "border-crimson-400/60" : "border-ink-600",
          className,
        )}
        {...props}
      />
      {error && (
        <p
          key={error}
          id={errorId}
          role="alert"
          className="mt-2 flex animate-shake items-center gap-1.5 text-sm text-crimson-300"
        >
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
