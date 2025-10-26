"use client"
export function Banner() {
  return (
    <header className="w-full" aria-label="Diamond inventory header">
      <div
        className="mx-auto max-w-7xl px-4 py-8 md:py-10 lg:py-12 transition-all duration-500 rounded-3xl shadow-sm ring-1 ring-black/5"
        style={{ background: "var(--banner-bg)", color: "var(--banner-fg)" }}
      >
        <div className="flex flex-col gap-4">
          <h1 className="text-balance text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            Diamond Inventory
          </h1>
          {/* Subtle divider respecting banner colors */}
          <div
            className="h-px w-full transition-opacity duration-500"
            style={{ background: "color-mix(in oklab, var(--banner-fg) 20%, transparent)" }}
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  )
}
