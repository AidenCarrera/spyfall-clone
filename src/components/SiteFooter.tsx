import Link from "next/link";
import { cn } from "@/lib/ui";

const linkClassName =
  "rounded px-1 py-0.5 transition-colors hover:text-paper-100";

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={cn(
        "relative mx-auto w-full max-w-3xl pt-6 text-center text-sm text-ink-400 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-white/10 before:to-transparent",
        compact ? "mt-8 sm:mt-10" : "mt-16",
      )}
    >
      <nav
        aria-label="Footer navigation"
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
      >
        <Link href="/rules" className={linkClassName}>
          Rules
        </Link>
        <span aria-hidden="true" className="size-1 rounded-full bg-ink-600" />
        <Link href="/privacy" className={linkClassName}>
          Privacy
        </Link>
        <span aria-hidden="true" className="size-1 rounded-full bg-ink-600" />
        <a
          href="https://github.com/AidenCarrera/spyfall-clone"
          target="_blank"
          rel="noreferrer"
          aria-label="Spyfall Clone repository on GitHub"
          className={linkClassName}
        >
          GitHub
        </a>
      </nav>
    </footer>
  );
}
