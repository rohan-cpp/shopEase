import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl">🧭</p>
      <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        The link may be broken or the product might have been delisted.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          Back to home
        </Link>
        <Link
          href="/products"
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          Browse products
        </Link>
      </div>
    </div>
  );
}
