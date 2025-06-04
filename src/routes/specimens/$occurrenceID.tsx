import { createFileRoute } from '@tanstack/react-router'
import Map, { Marker as MapLibreMarker } from 'react-map-gl/maplibre'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import 'maplibre-gl/dist/maplibre-gl.css'
import { SpecimenPage } from '@/features/search/components/specimen-page'

export const Route = createFileRoute('/specimens/$occurrenceID')({
  loader: async ({ params }) => {
    const response = await fetch(
      `http://localhost:8000/api/v1/occurrences/${params.occurrenceID}`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch occurrence data')
    }
    return response.json()
  },
  component: OccurrenceDetail,
})

function OccurrenceDetail() {
  const occurrence = Route.useLoaderData()
  return <SpecimenPage occurrence={occurrence} />
  
}
