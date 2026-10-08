"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { cn } from "@/lib/ui";

interface ConfirmOptions {
  message: ReactNode;
  confirmLabel: string;
  tone?: "danger" | "primary";
}

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  // Keep options mounted while dialog animates out
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback<Confirm>((nextOptions) => {
    resolveRef.current?.(false);
    setOptions(nextOptions);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const settle = (confirmed: boolean) => {
    resolveRef.current?.(confirmed);
    resolveRef.current = null;
    setIsOpen(false);
  };

  const tone = options?.tone ?? "danger";

  return (
    <ConfirmContext value={confirm}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={() => settle(false)}
        ariaLabelledBy="confirm-dialog-message"
        className="max-w-sm"
      >
        <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl ring-1",
              tone === "danger"
                ? "bg-crimson-500/12 text-crimson-400 ring-crimson-400/30"
                : "bg-brass-400/10 text-brass-400 ring-brass-400/25",
            )}
          >
            <TriangleAlert className="size-7" />
          </span>
          <p
            id="confirm-dialog-message"
            className="mt-5 text-balance text-base leading-relaxed text-ink-100"
          >
            {options?.message}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-white/[0.07] p-4">
          <Button variant="secondary" onClick={() => settle(false)}>
            Cancel
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => settle(true)}
          >
            {options?.confirmLabel}
          </Button>
        </div>
      </Modal>
    </ConfirmContext>
  );
}
