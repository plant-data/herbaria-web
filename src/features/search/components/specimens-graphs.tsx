import { useTranslation } from 'react-i18next'
import { GenericGraph } from '@/features/search/components/generic-graph' // Import the new component
import { MapGraph } from '@/features/search/components/map-graph'

export function SpecimensGraphs() {
  const { t } = useTranslation()

  return (
    <div className="max-w-full space-y-8 py-4">
      <div className="grid grid-cols-1 gap-6 @min-4xl/mainresult:grid-cols-2">
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
        <MapGraph className="col-span-1 @min-4xl/mainresult:col-span-2" />

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
