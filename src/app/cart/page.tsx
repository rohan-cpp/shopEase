import { readCartToken } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { CartView } from "@/components/cart-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Your cart" };

export default async function CartPage() {
  const token = await readCartToken();
  const cart = await getCart(token);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Your cart</h1>
      <p className="mt-2 text-sm text-slate-600">
        {cart.count > 0
          ? `${cart.count} item${cart.count === 1 ? "" : "s"} ready for checkout.`
          : "Nothing here yet."}
      </p>
      <div className="mt-8">
        <CartView initialCart={cart} />
      </div>
    </div>
  );
}
