import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "ShopEase — Modern online store",
    template: "%s · ShopEase",
  },
  description:
    "ShopEase is a full-stack e-commerce storefront: browse curated tech, home and lifestyle products, manage a cart and check out in seconds.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-lg font-black text-white">
                  S
                </span>
                <span className="text-lg font-bold tracking-tight">ShopEase</span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-slate-600">
                Carefully curated tech, home and lifestyle goods — shipped fast, backed by a
                30-day returns promise.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Shop</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <Link className="hover:text-indigo-600" href="/products">
                    All products
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-indigo-600" href="/products?sort=newest">
                    New arrivals
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-indigo-600" href="/products?sale=1">
                    Deals
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-indigo-600" href="/cart">
                    Your cart
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Account</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <Link className="hover:text-indigo-600" href="/orders">
                    Order history
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-indigo-600" href="/login">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-indigo-600" href="/register">
                    Create account
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-indigo-600" href="/admin">
                    Admin console
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Support</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>help@shopease.dev</li>
                <li>+1 (555) 010-2030</li>
                <li>Mon–Fri, 9am–6pm</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 px-4 py-5 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} ShopEase. Built with Next.js, Drizzle ORM and
            PostgreSQL.
          </div>
        </footer>
      </body>
    </html>
  );
}
