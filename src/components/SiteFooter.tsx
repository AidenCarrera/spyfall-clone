import Link from "next/link";

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={`mx-auto w-full max-w-3xl border-t border-slate-800 pt-6 text-center text-sm text-slate-500 ${
        compact ? "mt-6 sm:mt-8" : "mt-16"
      }`}
    >
      <nav
        aria-label="Footer navigation"
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
      >
        <Link
          href="/how-to-play"
          className="transition-colors hover:text-slate-300"
        >
          Help
        </Link>
        <Link
          href="/privacy"
          className="transition-colors hover:text-slate-300"
        >
          Privacy
        </Link>
        <a
          href="https://github.com/AidenCarrera/spyfall-clone"
          target="_blank"
          rel="noreferrer"
          aria-label="Spyfall Clone repository on GitHub"
          className="transition-colors hover:text-slate-300"
        >
          GitHub
        </a>
      </nav>
    </footer>
  );
}
