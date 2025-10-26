"use client"

import useSWRInfinite from "swr/infinite"
import { useMemo, useState, useRef, useEffect } from "react"
import type { Diamond } from "@/types/diamond"
import { REFRESH_INTERVAL_MS } from "@/lib/sheet-config"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DiamondCard } from "./diamond-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [color, setColor] = useState<string>("All")
  const [clarity, setClarity] = useState<string>("All")
  const [cut, setCut] = useState<string>("All")
  const [sortBy, setSortBy] = useState<string>("default")

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

  // Compute unique values for filters
  const filterOptions = useMemo(() => {
    const shapes = new Set<string>()
    const colors = new Set<string>()
    const clarities = new Set<string>()
    const cuts = new Set<string>()

    allItems.forEach((d) => {
      if (d.shape) shapes.add(d.shape)
      if (d.color) colors.add(d.color)
      if (d.clarity) clarities.add(d.clarity)
      if (d.cut) cuts.add(d.cut)
    })

    return {
      shapes: ["All", ...Array.from(shapes).sort()],
      colors: ["All", ...Array.from(colors).sort()],
      clarities: ["All", ...Array.from(clarities).sort()],
      cuts: ["All", ...Array.from(cuts).sort()],
    }
  }, [allItems])

  // Filtering and sorting
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let result = allItems.filter((d) => {
      const matchesQuery =
        !q ||
        [d.stock, d.report, d.shape, d.color, d.clarity]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      const matchesShape = shape === "All" || d.shape === shape
      const matchesColor = color === "All" || d.color === color
      const matchesClarity = clarity === "All" || d.clarity === clarity
      const matchesCut = cut === "All" || d.cut === cut
      
      return matchesQuery && matchesShape && matchesColor && matchesClarity && matchesCut
    })

    // Apply sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => (a.pricePerCt ?? 0) - (b.pricePerCt ?? 0))
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.pricePerCt ?? 0) - (a.pricePerCt ?? 0))
    } else if (sortBy === "weight-asc") {
      result.sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0))
    } else if (sortBy === "weight-desc") {
      result.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
    }

    return result
  }, [allItems, query, shape, color, clarity, cut, sortBy])

  const handleResetFilters = () => {
    setQuery("")
    setShape("All")
    setColor("All")
    setClarity("All")
    setCut("All")
    setSortBy("default")
  }

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
    <section className="space-y-6">
      <Toolbar
        query={query}
        onQueryChange={setQuery}
        shape={shape}
        onShapeChange={setShape}
        color={color}
        onColorChange={setColor}
        clarity={clarity}
        onClarityChange={setClarity}
        cut={cut}
        onCutChange={setCut}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        filterOptions={filterOptions}
        onReset={handleResetFilters}
        onRefresh={() => mutate()}
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
      {!isReachingEnd && filtered.length > 0 && (
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
  query,
  onQueryChange,
  shape,
  onShapeChange,
  color,
  onColorChange,
  clarity,
  onClarityChange,
  cut,
  onCutChange,
  sortBy,
  onSortByChange,
  filterOptions,
  onReset,
  onRefresh,
}: {
  query: string
  onQueryChange: (q: string) => void
  shape: string
  onShapeChange: (s: string) => void
  color: string
  onColorChange: (c: string) => void
  clarity: string
  onClarityChange: (c: string) => void
  cut: string
  onCutChange: (c: string) => void
  sortBy: string
  onSortByChange: (s: string) => void
  filterOptions: {
    shapes: string[]
    colors: string[]
    clarities: string[]
    cuts: string[]
  }
  onReset: () => void
  onRefresh: () => void
}) {
  return (
    <div className="space-y-2 rounded-xl border bg-white p-2 md:p-4">
      {/* Single Row Layout */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-3">
        {/* Search Bar - Smaller */}
        <div className="w-full lg:w-64">
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by stock, report..."
            className="w-full"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-1 flex-wrap items-end gap-3">
          {/* Shape */}
          <div className="flex-1 min-w-[120px] space-y-1">
            <label className="text-xs font-medium text-foreground">Shape:</label>
            <Select value={shape} onValueChange={onShapeChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.shapes.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="flex-1 min-w-[120px] space-y-1">
            <label className="text-xs font-medium text-foreground">Color:</label>
            <Select value={color} onValueChange={onColorChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.colors.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cut */}
          <div className="flex-1 min-w-[120px] space-y-1">
            <label className="text-xs font-medium text-foreground">Cut:</label>
            <Select value={cut} onValueChange={onCutChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.cuts.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clarity */}
          <div className="flex-1 min-w-[120px] space-y-1">
            <label className="text-xs font-medium text-foreground">Clarity:</label>
            <Select value={clarity} onValueChange={onClarityChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.clarities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="flex-1 min-w-[140px] space-y-1">
            <label className="text-xs font-medium text-foreground">Sort By:</label>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="weight-asc">Carat: Low to High</SelectItem>
                <SelectItem value="weight-desc">Carat: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={onReset} 
              variant="outline" 
              className="h-10 whitespace-nowrap"
            >
              Reset Filter
            </Button>
            <Button 
              onClick={onRefresh} 
              variant="outline"
              className="h-10"
            >
              Refresh
            </Button>
          </div>
        </div>
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