// The main component file
import { Suspense } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { GenericChart } from '@/features/search/components/generic-chart' // Import the new component
// You would also need a simple ErrorBoundary component
import { ErrorBoundary } from '@/features/search/components/error-boundary' 
import { MapGraph } from '@/features/search/components/map-graph'

function ChartSkeleton() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  )
}

function ChartErrorBoundaryFallback() {
   return (
      <Card className="shadow-xs">
        <CardContent className="p-4 text-red-600">
          <p>Error: Could not load chart data.</p>
        </CardContent>
      </Card>
   )
}


export function SpecimensGraphs() {
  return (
    <div className="space-y-8 p-4 max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Example for a single chart with ErrorBoundary */}
        <ErrorBoundary fallback={<ChartErrorBoundaryFallback />}>
          <Suspense fallback={<ChartSkeleton />}>
            <GenericChart
              title="Occurrences by Scientific Name"
              groupBy="scientificName"
              xAxisKey="scientificName"
              chartType="bar"
              color="#5470c6"
              topN={20}
            />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<ChartErrorBoundaryFallback />}>
          <Suspense fallback={<ChartSkeleton />}>
            <GenericChart
              title="Occurrences by Year"
              groupBy="year"
              xAxisKey="year"
              chartType="line"
              color="#91cc75"
            />
          </Suspense>
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<ChartErrorBoundaryFallback />}>
          <Suspense fallback={<ChartSkeleton />}>
            <GenericChart
              title="Occurrences by Month"
              groupBy="month"
              xAxisKey="month"
              chartType="line"
              color="#fa4858"
            />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<ChartErrorBoundaryFallback />}>
          <Suspense fallback={<ChartSkeleton />}>
            <GenericChart
              title="Occurrences by Floritaly Name"
              groupBy="floritalyName"
              xAxisKey="floritalyName"
              chartType="bar"
              color="#fac858"
              topN={20}
            />
          </Suspense>
        </ErrorBoundary>


        <Suspense fallback={<ChartSkeleton />}>
          <MapGraph />
        </Suspense>
      </div>
    </div>
  )
}