"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  ariaLabelledBy: string;
  className?: string;
  backdropClassName?: string;
}

export function Modal({
  children,
  onClose,
  ariaLabelledBy,
  className = "max-w-2xl",
  backdropClassName = "bg-black/30",
}: ModalProps) {
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
      (firstElement ?? dialogRef.current)?.focus();
    });

    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus();
      }
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog"
        className={`absolute inset-0 cursor-default backdrop-blur-sm ${backdropClassName}`}
        onClick={() => onCloseRef.current()}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        className={`relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-h-[90vh] flex flex-col ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
