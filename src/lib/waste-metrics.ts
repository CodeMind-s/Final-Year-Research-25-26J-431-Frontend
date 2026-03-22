export function formatPercent(value?: number | null, digits = 1): string {
  if (value === undefined || value === null) return 'NA'
  if (Number.isNaN(Number(value))) return 'NA'
  try {
    return `${Number(value).toFixed(digits)}%`
  } catch {
    return `${value}%`
  }
}

export function formatNumberOrNA(value?: number | null): string {
  if (value === undefined || value === null) return 'NA'
  try {
    return Number(value).toLocaleString()
  } catch {
    return String(value)
  }
}
