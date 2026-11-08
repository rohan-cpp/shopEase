import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const raw = params.next;
  const nextParam = Array.isArray(raw) ? raw[0] : raw;
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/products";
  const user = await getCurrentUser();
  if (user) redirect(next);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to check out faster and track your orders.
        </p>
        <div className="mt-6">
          <AuthForm mode="login" next={next} />
        </div>
        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-bold text-slate-900">Demo accounts</p>
          <p className="mt-1">
            Admin — <code className="font-semibold">admin@shopease.dev</code> / admin1234
          </p>
          <p>
            Shopper — <code className="font-semibold">shopper@shopease.dev</code> / shopper1234
          </p>
        </div>
      </div>

      <div className="hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-10 text-white lg:block">
        <h2 className="text-3xl font-black leading-tight">
          Members get more than free shipping.
        </h2>
        <ul className="mt-6 space-y-4 text-sm text-indigo-100">
          <li>⚡ Saved details for one-tap checkout</li>
          <li>📦 A complete, searchable order history</li>
          <li>⭐ Post reviews with your ShopEase profile</li>
          <li>🎁 Early access to clearance drops</li>
        </ul>
      </div>
    </div>
  );
}
