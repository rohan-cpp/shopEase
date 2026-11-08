"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewForm({
  productId,
  signedInName,
}: {
  productId: number;
  signedInName: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body, author }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save your review.");
        return;
      }
      setDone(true);
      setTitle("");
      setBody("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
      >
        Write a review
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Share your experience</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          Cancel
        </button>
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`${star} star`}
            onClick={() => setRating(star)}
            className={`text-2xl leading-none transition ${
              star <= rating ? "text-amber-400" : "text-slate-300 hover:text-amber-200"
            }`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-xs font-semibold text-slate-500">{rating}/5</span>
      </div>

      {!signedInName ? (
        <input
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Your name"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      ) : (
        <p className="text-xs text-slate-500">Posting as {signedInName}</p>
      )}

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Headline (optional)"
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={4}
        placeholder="What did you like or dislike? Minimum 10 characters."
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />

      {error ? <p className="text-xs font-semibold text-rose-600">{error}</p> : null}
      {done ? <p className="text-xs font-semibold text-emerald-600">Thanks for the review!</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}
