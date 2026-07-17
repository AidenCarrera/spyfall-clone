import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-900 to-slate-950 px-4 text-white">
      <div className="w-full max-w-md text-center">
        <p className="font-mono text-base font-bold text-blue-300">404</p>
        <h1 className="mt-3 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-slate-400">
          The page you requested does not exist or is no longer available.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
