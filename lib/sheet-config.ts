// The ID from your shared Google Sheet URL.
// You said you'll change it after code implementation — just swap this constant.
export const SHEET_ID = "1ou9RiO2cUWKbHlEGs1yQ8ayALpYbv7bM"

// Optional: if your data is in a specific sheet tab, set its gid (as a string).
// Leave empty to use the first/default sheet.
export const SHEET_GID = "938507281"

// We use the Google Visualization (GViz) API which returns structured JSON.
// This is more reliable than scraping CSV because headers and types are included.
export const SHEET_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json${
  SHEET_GID ? `&gid=${SHEET_GID}` : ""
}`

// Polling interval for the UI (in ms). Adjust as you want.
export const REFRESH_INTERVAL_MS = 10000
