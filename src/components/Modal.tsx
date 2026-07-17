"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  className?: string;
  backdropClassName?: string;
}

export function Modal({
  children,
  onClose,
  className = "max-w-2xl",
  backdropClassName = "bg-black/30",
}: ModalProps) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${backdropClassName}`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-h-[90vh] flex flex-col ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
