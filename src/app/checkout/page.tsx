import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { readCartToken } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { CheckoutForm } from "@/components/checkout-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [token, user] = await Promise.all([readCartToken(), getCurrentUser()]);
  const cart = await getCart(token);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/cart" className="hover:text-indigo-600">
          Cart
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-900">Checkout</span>
      </nav>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Checkout</h1>
      {!user ? (
        <p className="mt-3 text-sm text-slate-600">
          Checking out as a guest.{" "}
          <Link href="/login?next=/checkout" className="font-semibold text-indigo-600 hover:underline">
            Sign in
          </Link>{" "}
          to keep your order history in one place.
        </p>
      ) : (
        <p className="mt-3 text-sm text-slate-600">Signed in as {user.email}.</p>
      )}

      <div className="mt-8">
        <CheckoutForm cart={cart} user={user ? { name: user.name, email: user.email } : null} />
      </div>
    </div>
  );
}
