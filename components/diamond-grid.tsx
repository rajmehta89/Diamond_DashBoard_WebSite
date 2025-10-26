"use client"

import useSWRInfinite from "swr/infinite"
import { useMemo, useState, useRef, useEffect } from "react"
import type { Diamond } from "@/types/diamond"
import { REFRESH_INTERVAL_MS } from "@/lib/sheet-config"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DiamondCard } from "./diamond-card"

type ApiResp = {
  items: Diamond[]
  page: number
  totalPages: number
  updatedAt: string
}

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => {
    if (!r.ok) throw new Error(`API ${r.status} ${r.statusText}`)
    return r.json()
  }) as Promise<ApiResp>

const PAGE_SIZE = 50

export function DiamondGrid() {
  const [query, setQuery] = useState("")
  const [shape, setShape] = useState<string>("All")

  // SWR Infinite for paginated data
  const getKey = (pageIndex: number, previousPageData: ApiResp | null) => {
    if (previousPageData && pageIndex + 1 > previousPageData.totalPages) return null
    return `/api/diamonds?page=${pageIndex + 1}&limit=${PAGE_SIZE}`
  }

  const {
    data,
    error,
    size,
    setSize,
    isLoading,
    mutate,
    isValidating,
  } = useSWRInfinite<ApiResp>(getKey, fetcher, {
    refreshInterval: REFRESH_INTERVAL_MS,
    revalidateOnFocus: true,
  })

  // Combine all pages into one array
  const allItems = useMemo(
    () => data?.flatMap((d) => d.items) || [],
    [data]
  )

  // Compute unique shapes
  const shapes = useMemo(() => {
    const s = new Set<string>()
    allItems.forEach((d) => d.shape && s.add(d.shape))
    return ["All", ...Array.from(s).sort()]
  }, [allItems])

  // Filtering
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allItems.filter((d) => {
      const matchesQuery =
        !q ||
        [d.stock, d.report, d.shape, d.color, d.clarity]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      const matchesShape = shape === "All" || d.shape === shape
      return matchesQuery && matchesShape
    })
  }, [allItems, query, shape])

  const totalPages = data?.[0]?.totalPages ?? 1
  const isReachingEnd = size >= totalPages

  // Optional: Infinite Scroll (Auto-load when near bottom)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !isValidating) {
          setSize((s) => s + 1)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isReachingEnd, isValidating, setSize])

  return (
    <section className="space-y-4">
      <Toolbar
        shapes={shapes}
        shape={shape}
        onShapeChange={setShape}
        query={query}
        onQueryChange={setQuery}
        onRefresh={() => mutate()}
        updatedAt={data?.[0]?.updatedAt}
      />

      {isLoading && <Empty text="Loading diamonds..." />}
      {error && <Empty text="Could not load data. Please check your sheet." />}
      {!isLoading && !error && filtered.length === 0 && (
        <Empty text="No diamonds match your filters." />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((item) => (
          <DiamondCard key={`${item.stock}-${item.report}`} item={item} />
        ))}
      </div>

      {/* Load More Button (visible if not auto-scroll) */}
      {!isReachingEnd && (
        <div ref={loadMoreRef} className="flex justify-center p-4">
          <Button
            onClick={() => setSize((s) => s + 1)}
            disabled={isValidating}
            variant="outline"
          >
            {isValidating ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </section>
  )
}

function Toolbar({
  shapes,
  shape,
  onShapeChange,
  query,
  onQueryChange,
  onRefresh,
  updatedAt,
}: {
  shapes: string[]
  shape: string
  onShapeChange: (s: string) => void
  query: string
  onQueryChange: (q: string) => void
  onRefresh: () => void
  updatedAt?: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 md:flex-row md:items-center md:justify-between transition-all duration-300">
      <div className="flex flex-1 items-center gap-2">
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by stock, report, color, clarity..."
          className="max-w-md"
        />
        <div className="flex items-center gap-1 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {shapes.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={s === shape ? "default" : "ghost"}
              className={`snap-start rounded-full px-3 py-1 transition-colors ${
                s === shape ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"
              }`}
              onClick={() => onShapeChange(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {updatedAt && (
          <span className="text-xs text-muted-foreground">
            Updated {new Date(updatedAt).toLocaleTimeString()}
          </span>
        )}
        <Button onClick={onRefresh} variant="outline" size="sm" className="transition-colors bg-transparent">
          Refresh
        </Button>
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-8 text-center text-muted-foreground">
      {text}
    </div>
  )
}
