// diamond-card.tsx
"use client"

import { useState } from "react"
import type { Diamond } from "@/types/diamond"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DiamondDetailsModel } from "./diamond-details-modal"

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
        className="flex h-full cursor-pointer flex-col overflow-hidden border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        onClick={() => setOpen(true)}
      >
        {/* Fixed Height Header */}
        <CardHeader className="space-y-3 pb-4">
          {/* Title - Fixed Height */}
          <div className="flex min-h-[64px] items-start">
            <CardTitle className="line-clamp-2 text-pretty text-lg font-semibold leading-tight sm:text-xl md:text-2xl">
              {item.shape || "—"} <span className="text-muted-foreground">•</span> {item.weight != null ? item.weight : "—"} ct
            </CardTitle>
          </div>

          {/* Badges - Fixed Height Container */}
          <div className="flex min-h-[32px] flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {item.color || "—"}
            </Badge>
            <Badge variant="secondary" className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              {item.clarity || "—"}
            </Badge>
            {item.cut && (
              <Badge variant="secondary" className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                Cut {item.cut}
              </Badge>
            )}
            {item.lab && (
              <Badge variant="secondary" className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                {item.lab}
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* Content Area - Flex Grow to Fill Space */}
        <CardContent className="flex flex-grow flex-col space-y-4 pb-6">
          {/* Image Container - Fixed Aspect Ratio */}
          <div
            className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-muted to-muted/60"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(true)
            }}
          >
            {/* Loading Skeleton */}
            <div
              className={`absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted/80 to-muted/60 transition-opacity duration-500 ${
                loaded ? "opacity-0" : "opacity-100"
              }`}
            />
            
            {/* Diamond Image */}
            <img
              src={imgOk && item.imageUrl ? item.imageUrl : fallbackImg}
              alt={`${item.shape || 'Diamond'} ${item.weight || ''} ct`}
              className={`h-full w-full object-cover transition-all duration-500 hover:scale-105 ${
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

          {/* Price Badge - Centered & Fixed Height */}
          <div className="flex min-h-[28px] items-center justify-center">
            <Badge className="rounded-full bg-gradient-to-r from-accent to-accent/90 px-4 py-1.5 text-sm font-semibold text-accent-foreground shadow-sm">
              {price}
            </Badge>
          </div>

          {/* Action Buttons - Fixed Height, Push to Bottom */}
          <div className="mt-auto flex min-h-[40px] flex-wrap items-center justify-center gap-3">
            {item.videoUrl && (
              <Button 
                asChild 
                size="sm" 
                className="rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                  360° View
                </a>
              </Button>
            )}
            {item.certificateUrl && (
              <Button 
                asChild 
                size="sm" 
                variant="secondary" 
                className="rounded-full px-5 py-2 text-xs font-medium shadow-sm transition-all hover:shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <a href={item.certificateUrl} target="_blank" rel="noopener noreferrer">
                  Certificate
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Screen Details Page */}
      {open && <DiamondDetailsModel item={item} onClose={() => setOpen(false)} />}
    </>
  )
}