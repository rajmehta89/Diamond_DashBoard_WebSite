import { NextResponse } from "next/server"
import { SHEET_GVIZ_URL } from "@/lib/sheet-config"
import type { Diamond } from "@/types/diamond"

export const dynamic = "force-dynamic"
export const revalidate = 0

function parseGVizResponse(text: string) {
  const trimmed = text.trim()
  const start = trimmed.indexOf("(")
  const end = trimmed.lastIndexOf(")")
  if (start === -1 || end === -1 || end <= start + 1) {
    throw new Error("Unexpected GViz response format")
  }
  const jsonStr = trimmed.slice(start + 1, end)
  return JSON.parse(jsonStr)
}

function toHeaderLabels(cols: any[]) {
  return cols.map((c, idx) => (c?.label?.trim?.() || `col_${idx}`) as string)
}

function rowsToObjects(rows: any[], headers: string[]) {
  return rows.map((r) => {
    const obj: Record<string, any> = {}
    headers.forEach((h, i) => {
      const cell = r?.c?.[i]
      const v = (cell?.f ?? cell?.v ?? "").toString().trim()
      obj[h] = v
    })
    return obj
  })
}

function firstUrl(input: string): string {
  if (!input) return ""
  const urls = input.match(/https?:\/\/\S+/g) || []
  return urls[0] || ""
}

function lastUrl(input: string): string {
  if (!input) return ""
  const urls = input.match(/https?:\/\/\S+/g) || []
  return urls[urls.length - 1] || ""
}

function numOrNull(v: any): number | null {
  if (v === undefined || v === null) return null
  const n = Number.parseFloat(typeof v === "string" ? v.replace(/[^\d.-]/g, "") : String(v))
  return Number.isFinite(n) ? n : null
}

function pick(obj: Record<string, any>, keys: string[]): string {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== "") {
      return String(obj[k]).trim()
    }
  }
  return ""
}

function normalizeRow(raw: Record<string, any>): Diamond | null {
  const stock = pick(raw, ["Stock#", "Stock No", "Stock", "Stock Number"])
  const report = pick(raw, ["Report#", "Report No", "Report", "Report Number"])
  const shape = pick(raw, ["Shape"])
  const weightStr = pick(raw, ["Weight", "Carat", "Cts"])
  const color = pick(raw, ["Color"])
  const clarity = pick(raw, ["Clarity"])
  const cut = pick(raw, ["Cut"])
  const polish = pick(raw, ["Polish", "Poli", "Poli."])
  const symmetry = pick(raw, ["Sym", "Symmetry"])
  const fluro = pick(raw, ["Fluro", "Fluor", "Fluorescence", "Fluo"])
  const fancyColor = pick(raw, ["Fancy Color", "Fancy colour"])
  const fancyIntensity = pick(raw, ["Fancy Color Int", "Fancy Color Intensity"])
  const measurement = pick(raw, ["Measurement", "Measurements"])
  const tableStr = pick(raw, ["Table"])
  const depthStr = pick(raw, ["Depth"])
  const diamondType = pick(raw, ["Diam", "Diamond Type"])
  const lab = pick(raw, ["Lab"])
  const pricePerCtStr = pick(raw, ["$/Ct", "Price/Ct", "Price per Ct"])
  const videoRaw = pick(raw, ["Video", "Video Link", "360", "360°"])
  const imageRaw = pick(raw, ["Image", "Image URL", "Image Url", "Image Link", "Still"])
  const certRaw = pick(raw, ["Certificate", "Cert", "Certificate Link"])

  let imageUrl = firstUrl(imageRaw)
  const videoUrl = firstUrl(videoRaw)
  if (!imageUrl && videoUrl.includes("view.S360.services")) {
    try {
      const u = new URL(videoUrl)
      const d = u.searchParams.get("d")
      if (d) imageUrl = `https://view.S360.services/imaged/${d}/still.jpg`
    } catch {}
  }

  const certificateUrl = certRaw ? firstUrl(certRaw) : lastUrl(imageRaw)

  // ❗ Skip rows with no image or video to reduce heavy data
  if (!imageUrl && !videoUrl) return null

  return {
    stock,
    report,
    shape,
    weight: numOrNull(weightStr),
    color,
    clarity,
    cut,
    polish,
    symmetry,
    fluro,
    fancyColor,
    fancyIntensity,
    measurement,
    table: numOrNull(tableStr),
    depth: numOrNull(depthStr),
    diamondType,
    lab,
    pricePerCt: numOrNull(pricePerCtStr),
    videoUrl,
    imageUrl,
    certificateUrl,
    _raw: raw,
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const res = await fetch(SHEET_GVIZ_URL, {
      cache: "no-store",
      headers: { "User-Agent": "v0-diamond-dashboard" },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch sheet: ${res.status} ${res.statusText}` },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      )
    }

    const text = await res.text()
    const gviz = parseGVizResponse(text)
    const headers = toHeaderLabels(gviz?.table?.cols || [])
    const rows = rowsToObjects(gviz?.table?.rows || [], headers)

    // Normalize and filter
    const allItems = rows
      .filter((r: any) => Object.values(r).some((v) => String(v).trim() !== ""))
      .map((r: any) => normalizeRow(r))
      .filter((r): r is Diamond => r !== null)

    // Pagination logic
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedItems = allItems.slice(start, end)

    return NextResponse.json(
      {
        items: paginatedItems,
        page,
        limit,
        total: allItems.length,
        totalPages: Math.ceil(allItems.length / limit),
        updatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error parsing sheet" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
}
