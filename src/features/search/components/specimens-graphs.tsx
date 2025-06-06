// The main component file
import { GenericGraph } from '@/features/search/components/generic-graph' // Import the new component
import { MapGraph } from '@/features/search/components/map-graph'

export function SpecimensGraphs() {
  return (
    <div className="space-y-8 p-4 max-w-full">
      {/* Histogram Charts Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Distribution Histograms
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenericGraph
            title="Occurrences by Scientific Name"
            groupBy="scientificName"
            xAxisKey="scientificName"
            chartType="bar"
            color="#5470c6"
            topN={20}
          />

          <GenericGraph
            title="Occurrences by Floritaly Name"
            groupBy="floritalyName"
            xAxisKey="floritalyName"
            chartType="bar"
            color="#fac858"
            topN={20}
          />
        </div>
      </div>

      {/* Line Charts Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Temporal Trends
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenericGraph
            title="Occurrences by Year"
            groupBy="year"
            xAxisKey="year"
            chartType="line"
            color="#91cc75"
          />

          <GenericGraph
            title="Occurrences by Month"
            groupBy="month"
            xAxisKey="month"
            chartType="line"
            color="#fa4858"
          />
        </div>
      </div>

      {/* Map Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Geographic Distribution
        </h2>
        <MapGraph className="w-full" />
      </div>
    </div>
  )
}
