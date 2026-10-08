import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({
  href,
  children,
}: {
  href: Route;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-lg py-1.5 pr-2 text-sm font-medium text-ink-300 transition-colors hover:text-paper-50"
    >
      <span className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] transition-[transform,background-color,border-color] duration-200 group-hover:-translate-x-0.5 group-hover:border-white/20 group-hover:bg-white/[0.07]">
        <ArrowLeft aria-hidden="true" className="size-4" />
      </span>
      {children}
    </Link>
  );
}
