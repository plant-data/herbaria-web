// The main component file
import { Suspense } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { GenericChart } from '@/features/search/components/generic-chart' // Import the new component
// You would also need a simple ErrorBoundary component
import { ErrorBoundary } from '@/features/search/components/error-boundary'
import { MapGraph } from '@/features/search/components/map-graph'

export function SpecimensGraphs() {
  return (
    <div className="space-y-8 p-4 max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GenericChart
          title="Occurrences by Scientific Name"
          groupBy="scientificName"
          xAxisKey="scientificName"
          chartType="bar"
          color="#5470c6"
          topN={20}
        />

        <GenericChart
          title="Occurrences by Year"
          groupBy="year"
          xAxisKey="year"
          chartType="line"
          color="#91cc75"
        />

        <MapGraph className="col-span-2" />

        <GenericChart
          title="Occurrences by Month"
          groupBy="month"
          xAxisKey="month"
          chartType="line"
          color="#fa4858"
        />

        <GenericChart
          title="Occurrences by Floritaly Name"
          groupBy="floritalyName"
          xAxisKey="floritalyName"
          chartType="bar"
          color="#fac858"
          topN={20}
        />
      </div>
    </div>
  )
}
