import type { CSSProperties } from "react";
import { twMerge, type ClassNameValue } from "tailwind-merge";

export function cn(...classes: ClassNameValue[]) {
  return twMerge(...classes);
}

/** Delays entrance animations so sibling elements cascade in. */
export function stagger(index: number, stepMs = 70): CSSProperties {
  return { animationDelay: `${index * stepMs}ms` };
}
