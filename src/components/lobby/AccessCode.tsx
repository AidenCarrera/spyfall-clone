"use client";

import { useState } from "react";
import { Check, Copy, Link as LinkIcon } from "lucide-react";
import { Card } from "@/src/components/Card";

interface AccessCodeProps {
  code: string;
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
    <Card className="text-center space-y-4">
      <div className="space-y-1">
        <p className="text-slate-400 text-xs uppercase tracking-wider">
          Access Code
        </p>
        <p className="text-5xl font-mono font-bold text-blue-400 tracking-widest">
          {code}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5">
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer select-none focus:outline-none"
          title="Copy Access Code"
        >
          {isCodeCopied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Code</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer select-none focus:outline-none"
          title="Copy Invite Link"
        >
          {isLinkCopied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" />
              <span>Copy Invite Link</span>
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
