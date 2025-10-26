export type Diamond = {
  stock: string
  report: string
  shape: string
  weight: number | null
  color: string
  clarity: string
  cut: string
  polish: string
  symmetry: string
  fluro: string
  fancyColor: string
  fancyIntensity: string
  measurement: string
  table: number | null
  depth: number | null
  diamondType: string
  lab: string
  pricePerCt: number | null
  videoUrl: string
  imageUrl: string
  certificateUrl: string
  // Keep the raw row in case you want to show more later
  _raw?: Record<string, any>
}
