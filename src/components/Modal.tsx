"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/ui";

interface ModalProps {
  isOpen: boolean;
  children: ReactNode;
  onClose: () => void;
  ariaLabelledBy: string;
  ariaDescribedBy?: string;
  className?: string;
  backdropClassName?: string;
}

export function Modal({ isOpen, ...dialogProps }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && <ModalDialog key="dialog" {...dialogProps} />}
    </AnimatePresence>
  );
}

function ModalDialog({
  children,
  onClose,
  ariaLabelledBy,
  ariaDescribedBy,
  className = "max-w-2xl",
  backdropClassName = "bg-ink-950/70",
}: Omit<ModalProps, "isOpen">) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const getFocusableElements = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ??
          [],
      ).filter(
        (element) =>
          !element.hasAttribute("hidden") &&
          element.tabIndex >= 0 &&
          element.getClientRects().length > 0,
      );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const activeElement = document.activeElement;
      if (
        event.shiftKey &&
        (activeElement === firstElement ||
          !dialogRef.current?.contains(activeElement))
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement ||
          !dialogRef.current?.contains(activeElement))
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    const focusFrame = requestAnimationFrame(() => {
      const firstElement = getFocusableElements()[0];
      (firstElement ?? dialogRef.current)?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus({ preventScroll: true });
      }
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <motion.button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog"
        className={cn(
          "absolute inset-0 cursor-default backdrop-blur-sm",
          backdropClassName,
        )}
        onClick={() => onCloseRef.current()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-b-0 border-white/10 bg-ink-900 shadow-[0_-20px_60px_-20px_rgb(0_0_0/0.8)] outline-none before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-white/25 before:to-transparent sm:max-h-[88vh] sm:rounded-2xl sm:border-b sm:shadow-[0_40px_80px_-24px_rgb(0_0_0/0.9)]",
          className,
        )}
        initial={{ opacity: 0, y: 48, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 36 }}
      >
        {children}
      </motion.div>
    </div>,
    document.body,
  );
}

export function ModalHeader({
  id,
  title,
  icon,
  onClose,
  closeLabel,
}: {
  id: string;
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  closeLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-6">
      <h2
        id={id}
        className="flex items-center gap-3 font-display text-2xl font-bold uppercase tracking-[0.05em] text-paper-50"
      >
        {icon && (
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-xl bg-brass-400/10 text-brass-400 ring-1 ring-brass-400/25 [&>svg]:size-5"
          >
            {icon}
          </span>
        )}
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-300 transition-colors hover:bg-white/[0.06] hover:text-white"
        aria-label={closeLabel}
      >
        <X aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}
