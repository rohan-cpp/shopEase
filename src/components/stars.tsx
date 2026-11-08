function StarGlyph({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.28 3.95a1 1 0 0 0 .95.69h4.15c.97 0 1.37 1.24.59 1.81l-3.36 2.44a1 1 0 0 0-.36 1.12l1.28 3.95c.3.92-.75 1.69-1.54 1.12l-3.35-2.44a1 1 0 0 0-1.18 0l-3.35 2.44c-.79.57-1.84-.2-1.54-1.12l1.28-3.95a1 1 0 0 0-.36-1.12L2.09 9.38c-.78-.57-.38-1.81.59-1.81h4.15a1 1 0 0 0 .95-.69l1.27-3.95Z" />
    </svg>
  );
}

export function Stars({
  value,
  size = "sm",
  showValue = false,
  count,
}: {
  value: number;
  size?: "sm" | "md";
  showValue?: boolean;
  count?: number;
}) {
  const rounded = Math.max(0, Math.min(5, Math.round(value * 2) / 2));
  const dimension = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = rounded >= star ? 1 : rounded >= star - 0.5 ? 0.5 : 0;
          return (
            <span key={star} className="relative inline-flex">
              <StarGlyph className={`${dimension} text-slate-300`} />
              {fill > 0 ? (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <StarGlyph className={`${dimension} text-amber-400`} />
                </span>
              ) : null}
            </span>
          );
        })}
      </span>
      {showValue ? (
        <span className="text-xs font-medium text-slate-600">
          {value ? value.toFixed(1) : "New"}
          {typeof count === "number" && count > 0 ? ` (${count})` : ""}
        </span>
      ) : null}
      <span className="sr-only">{value.toFixed(1)} out of 5 stars</span>
    </span>
  );
}
