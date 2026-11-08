import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Create account" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const raw = params.next;
  const nextParam = Array.isArray(raw) ? raw[0] : raw;
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/products";
  const user = await getCurrentUser();
  if (user) redirect(next);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600">It takes about 20 seconds.</p>
        <div className="mt-6">
          <AuthForm mode="register" next={next} />
        </div>
      </div>

      <div className="hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-800 to-indigo-600 p-10 text-white lg:block">
        <h2 className="text-3xl font-black leading-tight">
          Your cart, wishlist and orders — all in sync.
        </h2>
        <p className="mt-4 text-sm text-indigo-100">
          ShopEase keeps your cart between devices, remembers your shipping details and shows
          live stock levels on everything you have saved.
        </p>
      </div>
    </div>
  );
}
