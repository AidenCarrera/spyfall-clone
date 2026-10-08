"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Link as LinkIcon } from "lucide-react";
import { Card } from "@/components/Card";
import { cn, stagger } from "@/lib/ui";

interface AccessCodeProps {
  code: string;
}

function CopyButton({
  isCopied,
  onClick,
  title,
  icon,
  label,
}: {
  isCopied: boolean;
  onClick: () => void;
  title: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex h-10 select-none items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors duration-200",
        isCopied
          ? "border-brass-400/50 bg-brass-400/12 text-brass-300"
          : "border-white/10 bg-white/[0.04] text-ink-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isCopied ? "copied" : "idle"}
          className="flex items-center gap-1.5 [&>svg]:size-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.14 }}
        >
          {isCopied ? (
            <>
              <Check aria-hidden="true" strokeWidth={3} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              {icon}
              <span>{label}</span>
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function AccessCode({ code }: AccessCodeProps) {
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCodeCopied(true);
      setTimeout(() => setIsCodeCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      const inviteUrl = `${window.location.origin}/join?code=${code}`;
      await navigator.clipboard.writeText(inviteUrl);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy invite link:", err);
    }
  };

  return (
    <Card className="text-center">
      <p className="eyebrow">Access Code</p>

      <p className="sr-only">{code}</p>
      <div
        aria-hidden="true"
        className="mt-4 flex justify-center gap-1.5 sm:gap-2"
      >
        {code.split("").map((char, index) => (
          <span
            key={`${index}-${char}`}
            style={stagger(index, 65)}
            className="relative flex h-15 w-10 animate-flap-in items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-ink-700 font-mono text-[1.75rem] font-bold text-brass-300 shadow-[inset_0_1px_0_rgb(255_255_255/0.1),0_8px_16px_-8px_rgb(0_0_0/0.9)] [text-shadow:0_0_14px_rgb(245_195_91/0.22)] sm:h-18 sm:w-12 sm:text-4xl"
          >
            {char}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <CopyButton
          isCopied={isCodeCopied}
          onClick={handleCopyCode}
          title="Copy Access Code"
          icon={<Copy aria-hidden="true" />}
          label="Copy Code"
        />
        <CopyButton
          isCopied={isLinkCopied}
          onClick={handleCopyLink}
          title="Copy Invite Link"
          icon={<LinkIcon aria-hidden="true" />}
          label="Copy Invite Link"
        />
      </div>

      <p aria-live="polite" className="sr-only">
        {isCodeCopied || isLinkCopied ? "Copied!" : ""}
      </p>
    </Card>
  );
}
