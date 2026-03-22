"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/crystal/ui/card'
import { formatNumberOrNA } from '@/lib/waste-metrics'

export default function ReportsReader({ initialData }: { initialData?: any } ) {
  const [data, setData] = useState<any | null>(initialData ?? null)

  useEffect(() => {
    if (initialData) {
      setData(initialData)
      return
    }
    // No session persistence: only load when `initialData` is provided
  }, [initialData])

  if (!data) return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">No report loaded. Use the Reports page to load and download detailed reports.</p>
    </Card>
  )

  return (
    <div className="space-y-4 p-3">
      <Card className="p-4">
        <h3 className="font-semibold">Report Summary</h3>
        <div className="mt-2 grid grid-cols-1 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Range</p>
            <p className="font-medium">{data.summary?.start_month} → {data.summary?.end_month}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Detailed Rows</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="py-2">Month</th>
                <th className="py-2">Predicted Waste</th>
                <th className="py-2">Production</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data.rows) && data.rows.map((r: any) => (
                <tr key={r.month} className="border-t">
                  <td className="py-2">{r.month}</td>
                  <td className="py-2">{formatNumberOrNA(r.predicted_waste)}</td>
                  <td className="py-2">{formatNumberOrNA(r.production_volume)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
