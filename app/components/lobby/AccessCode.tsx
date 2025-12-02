"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card } from "@/app/components/Card";

interface AccessCodeProps {
  code: string;
}

export function AccessCode({ code }: AccessCodeProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Card className="text-center space-y-2">
      <p className="text-slate-400 text-sm uppercase tracking-wider">
        Access Code
      </p>
      <div className="flex items-center justify-center">
        <div className="relative">
          <p className="text-5xl font-mono font-bold text-blue-400 tracking-widest">
            {code}
          </p>
          <div className="absolute left-full top-1/2 -translate-y-8/19 ml-4">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              title="Copy Access Code"
            >
              {isCopied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
