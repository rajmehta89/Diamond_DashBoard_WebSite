"use client"

import { X } from "lucide-react"
import type { Diamond } from "@/types/diamond"

export function DiamondDetailsModal({ item, onClose }: { item: Diamond; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-gray-600 hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        <h2 className="mb-4 text-2xl font-semibold">
          {item.shape || "—"} • {item.weight ?? "—"} ct
        </h2>

        {/* Image */}
        <div className="mb-4 rounded-xl border overflow-hidden">
          <img
            src={item.imageUrl || "/placeholder.svg"}
            alt={`Diamond ${item.stock}`}
            className="w-full object-cover"
          />
        </div>

        {/* Table-like details */}
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
          <Field label="Color">{item.color || "—"}</Field>
          <Field label="Clarity">{item.clarity || "—"}</Field>
          <Field label="Cut">{item.cut || "—"}</Field>
          <Field label="Symmetry">{item.symmetry || "—"}</Field>
          <Field label="Polish">{item.polish || "—"}</Field>
          <Field label="Fluor">{item.fluro || "—"}</Field>
          <Field label="Fancy Color">{item.fancyColor || "—"}</Field>
          <Field label="Intensity">{item.fancyIntensity || "—"}</Field>
          <Field label="Table">{item.table ?? "—"}</Field>
          <Field label="Depth">{item.depth ?? "—"}</Field>
          <Field label="Measurement">{item.measurement || "—"}</Field>
          <Field label="Report">{item.report || "—"}</Field>
        </div>

        {/* Optional Video */}
        {item.videoUrl && (
          <div className="mt-4">
            <iframe
              src={item.videoUrl}
              title={`Diamond ${item.stock}`}
              className="aspect-video w-full rounded-lg border"
              allow="autoplay; fullscreen"
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[100px,1fr] items-center gap-2">
      <div className="text-gray-500">{label}</div>
      <div className="font-medium text-gray-800">{children}</div>
    </div>
  )
}
