"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { ConfirmProvider } from "./ConfirmDialog";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ConfirmProvider>{children}</ConfirmProvider>
    </MotionConfig>
  );
}
