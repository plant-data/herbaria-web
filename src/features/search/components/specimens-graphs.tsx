import { GenericGraph } from '@/features/search/components/generic-graph' // Import the new component
import { MapGraph } from '@/features/search/components/map-graph'

export function SpecimensGraphs() {
  return (
    <div className="space-y-8 p-4 max-w-full">
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
          title="Occurrences by Year"
          groupBy="year"
          xAxisKey="year"
          chartType="line"
          color="#91cc75"
        />
        <MapGraph className="col-span-1 lg:col-span-2 " />

        <GenericGraph
          title="Occurrences by Floritaly Name"
          groupBy="floritalyName"
          xAxisKey="floritalyName"
          chartType="bar"
          color="#fac858"
          topN={20}
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
  )
}
