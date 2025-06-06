import { useTranslation } from 'react-i18next'
import { GenericGraph } from '@/features/search/components/generic-graph' // Import the new component
import { MapGraph } from '@/features/search/components/map-graph'

export function SpecimensGraphs() {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-8 p-4 max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GenericGraph
          title={t('search.results.specimens-by-scientific-name')}
          groupBy="scientificName"
          xAxisKey="scientificName"
          chartType="bar"
          color="#5470c6"
          topN={20}
        />
        <GenericGraph
          title={t('search.results.specimens-by-year')}
          groupBy="year"
          xAxisKey="year"
          chartType="line"
          color="#91cc75"
        />
        <MapGraph className="col-span-1 lg:col-span-2 " />

        <GenericGraph
          title={t('search.results.specimens-by-floritaly-name')}
          groupBy="floritalyName"
          xAxisKey="floritalyName"
          chartType="bar"
          color="#fac858"
          topN={20}
        />

        <GenericGraph
          title={t('search.results.specimens-by-month')}
          groupBy="month"
          xAxisKey="month"
          chartType="line"
          color="#fa4858"
        />
      </div>
    </div>
  )
}
