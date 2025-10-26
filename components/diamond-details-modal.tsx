// diamond-details-page.tsx
"use client"

import { ArrowLeft } from "lucide-react"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import type { Diamond } from "@/types/diamond"

type Props = {
  item: Diamond
  onClose: () => void
}

export function DiamondDetailsModel({ item, onClose }: Props) {
  const price = item.pricePerCt != null ? `$${item.pricePerCt.toLocaleString()}` : "—"
  const fallbackImg = "/placeholder.svg?height=600&width=600&query=diamond"

  // Prevent body scroll when details page is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const content = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-white">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 transition-all hover:bg-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Inventory</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Left side - Image */}
          <div className="relative rounded-2xl bg-gray-100 p-8 md:p-12 lg:p-16">
            <img
              src={item.imageUrl || fallbackImg}
              alt={`Diamond ${item.stock}`}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Right side - Details */}
          <div className="flex flex-col">
            {/* Title */}
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Diamond {item.stock || "VRD-8-8"}
            </h1>

            {/* Details List */}
            <div className="mb-6 space-y-4 border-b pb-6">
              <DetailRow label="Shape:" value={item.shape || "—"} />
              <DetailRow 
                label="Dimensions:" 
                value={item.measurement || "—"} 
              />
              <DetailRow 
                label="Carat Weight:" 
                value={item.weight != null ? `${item.weight}` : "—"} 
              />
              <DetailRow label="Color:" value={item.color || "N/A"} />
              <DetailRow label="Clarity:" value={item.clarity || "—"} />
              <DetailRow label="Cut Grade:" value={item.cut || "—"} />
              <DetailRow label="Polish:" value={item.polish || "—"} />
              <DetailRow label="Symmetry:" value={item.symmetry || "—"} />
              <DetailRow 
                label="Fluorescence Intensity:" 
                value={item.fluro || "—"} 
              />
              {item.fancyColor && (
                <DetailRow 
                  label="Fancy Color Main Body:" 
                  value={item.fancyColor} 
                />
              )}
              {item.fancyIntensity && (
                <DetailRow 
                  label="Fancy Color Intensity:" 
                  value={item.fancyIntensity} 
                />
              )}
              <DetailRow 
                label="Growth Type:" 
                value={item.diamondType || "—"} 
              />
              {item.table != null && (
                <DetailRow label="Table:" value={`${item.table}%`} />
              )}
              {item.depth != null && (
                <DetailRow label="Depth:" value={`${item.depth}%`} />
              )}
              {item.lab && (
                <DetailRow label="Lab:" value={item.lab} />
              )}
              {item.report && (
                <DetailRow label="Report:" value={item.report} />
              )}
            </div>

            {/* Price */}
            <div className="mb-6">
              <DetailRow 
                label="Price:" 
                value={price}
                valueClassName="text-3xl font-bold text-gray-900"
              />
            </div>

            {/* Availability */}
            <div className="mb-8">
              <span className="inline-block rounded-full bg-green-100 px-5 py-2 text-base font-semibold text-green-700">
                Available
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {item.videoUrl && (
                <a
                  href={item.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-gray-900 bg-gray-900 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-gray-800"
                >
                  360° View
                </a>
              )}
              {item.certificateUrl && (
                <a
                  href={item.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-gray-900 bg-white px-8 py-4 text-base font-semibold text-gray-900 transition-all hover:bg-gray-900 hover:text-white"
                >
                  View Certificate
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Use portal to render at document root
  return typeof document !== 'undefined' 
    ? createPortal(content, document.body)
    : null
}

function DetailRow({ 
  label, 
  value, 
  valueClassName = "text-gray-700" 
}: { 
  label: string
  value: string | number
  valueClassName?: string
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="min-w-[220px] text-lg font-semibold text-gray-900">{label}</span>
      <span className={`text-lg ${valueClassName}`}>{value}</span>
    </div>
  )
}