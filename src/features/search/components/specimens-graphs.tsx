import { useTranslation } from 'react-i18next'
import { HistogramGraph, LineGraph } from '@/features/search/components/generic-graph'
import { MapGraph } from '@/features/search/components/map-graph'

export function SpecimensGraphs() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8 py-4">
      <div className="grid grid-cols-1 gap-6 @min-4xl/mainresult:grid-cols-2">
        <HistogramGraph
          title={t('search.results.specimens-by-scientific-name')}
          groupBy="scientificName"
          yAxisKey="scientificName"
          color="#5470c6"
          topN={20}
        />
        <LineGraph title={t('search.results.specimens-by-year')} groupBy="year" xAxisKey="year" color="#91cc75" />
        <MapGraph className="col-span-1 @min-4xl/mainresult:col-span-2" />

        <HistogramGraph
          title={t('search.results.specimens-by-floritaly-name')}
          groupBy="floritalyName"
          yAxisKey="floritalyName"
          color="#fac858"
          topN={20}
        />

        <LineGraph title={t('search.results.specimens-by-month')} groupBy="month" xAxisKey="month" color="#fa4858" />
      </div>
    </div>
  )
}
