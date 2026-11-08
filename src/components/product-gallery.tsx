"use client";

import { useState } from "react";

export function ProductGallery({
  images,
  name,
  discount,
}: {
  images: string[];
  name: string;
  discount: number;
}) {
  const gallery = images.length ? images : [""];
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gallery[Math.min(active, gallery.length - 1)]}
          alt={name}
          className="h-full w-full object-cover"
        />
        {discount > 0 ? (
          <span className="absolute left-4 top-4 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow">
            Save {discount}%
          </span>
        ) : null}
      </div>
      {gallery.length > 1 ? (
        <div className="se-rail flex gap-3 overflow-x-auto pb-1">
          {gallery.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${
                active === index ? "border-indigo-600" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
