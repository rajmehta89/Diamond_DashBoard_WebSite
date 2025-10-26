"use client"

import { useState } from "react"
import type { Diamond } from "@/types/diamond"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DiamondDetailsModal } from "./diamond-details-modal"

type Props = {
  item: Diamond
}

export function DiamondCard({ item }: Props) {
  const [imgOk, setImgOk] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)

  const fallbackImg = `/placeholder.svg?height=320&width=480&query=diamond%20still%20image`
  const price = item.pricePerCt != null ? `$${item.pricePerCt.toLocaleString()}/ct` : "Price/ct —"

  return (
    <>
      <Card
        className="h-full cursor-pointer border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        onClick={() => setOpen(true)}
      >
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

          {/* <div className="text-xs text-muted-foreground">
            <span className="font-mono">{item.stock || "—"}</span>{" "}
            {item.report ? <span>• Report {item.report}</span> : null}
          </div> */}
        </CardHeader>

        <CardContent className="space-y-4">
          <div
            className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(true)
            }}
          >
            <div
              className={`absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted/60 transition-opacity duration-500 ${
                loaded ? "opacity-0" : "opacity-100"
              }`}
            />
            <img
              src={imgOk && item.imageUrl ? item.imageUrl : fallbackImg}
              alt={`Diamond ${item.stock} image`}
              className={`h-full w-full object-cover transition-opacity duration-500 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={() => {
                setImgOk(false)
                setLoaded(true)
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* <div className="text-sm">
              <span className="text-muted-foreground">Shape</span>{" "}
              <span className="font-medium">{item.shape || "—"}</span>
              <span className="text-muted-foreground"> • Weight</span>{" "}
              <span className="font-medium">{item.weight ?? "—"} ct</span>
            </div> */}

            <div className="flex gap-10">
              {item.videoUrl && (
                <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground">
                  <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                    360° View
                  </a>
                </Button>
              )}
              {item.certificateUrl && (
                <Button asChild size="sm" variant="secondary" className="rounded-full">
                  <a href={item.certificateUrl} target="_blank" rel="noopener noreferrer">
                    Certificate
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal showing full data */}
      {open && <DiamondDetailsModal item={item} onClose={() => setOpen(false)} />}
    </>
  )
}
