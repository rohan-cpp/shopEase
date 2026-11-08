"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function Pagination({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  const params = useSearchParams();
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(target));
    return `/products?${next.toString()}`;
  };

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (candidate) =>
      candidate === 1 ||
      candidate === pageCount ||
      Math.abs(candidate - page) <= 1,
  );

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100"
        >
          ← Prev
        </Link>
      ) : null}
      {pages.map((candidate, index) => {
        const previous = pages[index - 1];
        const gap = previous && candidate - previous > 1;
        return (
          <span key={candidate} className="flex items-center gap-2">
            {gap ? <span className="text-slate-400">…</span> : null}
            <Link
              href={href(candidate)}
              aria-current={candidate === page ? "page" : undefined}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                candidate === page
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {candidate}
            </Link>
          </span>
        );
      })}
      {page < pageCount ? (
        <Link
          href={href(page + 1)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100"
        >
          Next →
        </Link>
      ) : null}
    </nav>
  );
}
