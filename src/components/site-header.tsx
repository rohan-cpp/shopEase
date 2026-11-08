import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { CartBadge } from "@/components/cart-badge";
import { LogoutButton } from "@/components/logout-button";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-900 text-white shadow-sm">
      <div className="bg-indigo-600/90 px-4 py-1.5 text-center text-xs font-medium tracking-wide">
        Free shipping over $75 · 30-day easy returns · Use code{" "}
        <span className="font-bold text-amber-300">SHOPEASE10</span> for 10% off
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500 text-lg font-black">
            S
          </span>
          <span className="text-lg font-bold tracking-tight">ShopEase</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          <Link className="rounded-lg px-3 py-2 hover:bg-white/10" href="/products">
            Shop all
          </Link>
          <Link className="rounded-lg px-3 py-2 hover:bg-white/10" href="/products?category=audio">
            Audio
          </Link>
          <Link className="rounded-lg px-3 py-2 hover:bg-white/10" href="/products?category=wearables">
            Wearables
          </Link>
          <Link className="rounded-lg px-3 py-2 hover:bg-white/10" href="/products?category=home-living">
            Home
          </Link>
          <Link className="rounded-lg px-3 py-2 text-amber-300 hover:bg-white/10" href="/products?sale=1">
            Deals
          </Link>
        </nav>

        <form action="/products" className="ml-auto hidden max-w-xs flex-1 lg:block">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <input
              type="search"
              name="q"
              placeholder="Search products…"
              className="w-full rounded-full border border-white/15 bg-white/10 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-300 focus:border-amber-300 focus:outline-none"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="hidden rounded-full bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 sm:inline-flex"
                >
                  Admin
                </Link>
              ) : null}
              <Link
                href="/orders"
                className="hidden rounded-full bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20 sm:inline-flex"
              >
                {user.name.split(" ")[0]}&apos;s orders
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20 sm:inline-flex"
            >
              Sign in
            </Link>
          )}
          <CartBadge />
        </div>
      </div>
      <form action="/products" className="px-4 pb-3 lg:hidden">
        <input
          type="search"
          name="q"
          placeholder="Search products…"
          className="w-full rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-slate-300 focus:border-amber-300 focus:outline-none"
        />
      </form>
    </header>
  );
}
