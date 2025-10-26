"use client"

import type React from "react"

import { useState } from "react"
import type { Diamond } from "@/types/diamond"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Props = {
  item: Diamond
}

export function DiamondCard({ item }: Props) {
  const [imgOk, setImgOk] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const fallbackImg = `/placeholder.svg?height=320&width=480&query=diamond%20still%20image`

  const price = item.pricePerCt != null ? `$${item.pricePerCt.toLocaleString()}/ct` : "Price/ct —"

  return (
    <Card className="h-full border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-pretty text-xl md:text-2xl">
            {item.shape || "—"} <span className="text-muted-foreground">•</span> {item.weight ?? "—"} ct
          </CardTitle>
          <Badge className="rounded-full bg-accent text-accent-foreground">{price}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">
            {item.color || "—"}
          </Badge>
          <Badge variant="secondary" className="rounded-full bg-primary text-primary-foreground">
            {item.clarity || "—"}
          </Badge>
          {item.cut && (
            <Badge variant="secondary" className="rounded-full bg-secondary text-secondary-foreground">
              Cut {item.cut}
            </Badge>
          )}
          {item.lab && (
            <Badge variant="secondary" className="rounded-full bg-muted text-foreground">
              {item.lab}
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <span className="font-mono">{item.stock || "—"}</span>{" "}
          {item.report ? <span>• Report {item.report}</span> : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted">
          {/* shimmer */}
          <div
            className={`absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted/60 transition-opacity duration-500 ${
              loaded ? "opacity-0" : "opacity-100"
            }`}
          />
          <img
            src={imgOk && item.imageUrl ? item.imageUrl : fallbackImg}
            alt={`Diamond ${item.stock} image`}
            className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setImgOk(false)
              setLoaded(true)
            }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Shape</span>{" "}
            <span className="font-medium">{item.shape || "—"}</span>
            <span className="text-muted-foreground"> • Weight</span>{" "}
            <span className="font-medium">{item.weight ?? "—"} ct</span>
          </div>
          <div className="flex gap-2">
            {item.videoUrl ? (
              <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground transition-colors">
                <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                  360° View
                </a>
              </Button>
            ) : null}
            {item.certificateUrl ? (
              <Button asChild size="sm" variant="secondary" className="rounded-full transition-colors">
                <a href={item.certificateUrl} target="_blank" rel="noopener noreferrer">
                  Certificate
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <details className="rounded-xl border p-4 open:bg-muted/40 transition-colors duration-300">
          <summary className="cursor-pointer text-sm font-semibold">Specifications</summary>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
            <Field label="Symmetry">{item.symmetry || "—"}</Field>
            <Field label="Polish">{item.polish || "—"}</Field>
            <Field label="Fluor">{item.fluro || "—"}</Field>
            <Field label="Fancy Color">{item.fancyColor || "—"}</Field>
            <Field label="Intensity">{item.fancyIntensity || "—"}</Field>
            <Field label="Table">{item.table ?? "—"}</Field>
            <Field label="Depth">{item.depth ?? "—"}</Field>
            <div className="col-span-2 md:col-span-3">
              <Field label="Measurement">{item.measurement || "—"}</Field>
            </div>

            {item.videoUrl ? (
              <div className="col-span-2 md:col-span-3">
                <div className="overflow-hidden rounded-lg bg-black/5">
                  <iframe
                    src={item.videoUrl}
                    title={`Video ${item.stock}`}
                    className="aspect-video w-full"
                    allow="autoplay; fullscreen"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  If the viewer is blocked by the source, open via the 360° View button above.
                </p>
              </div>
            ) : null}
          </div>
        </details>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[96px,1fr] items-center gap-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{children}</div>
    </div>
  )
}
