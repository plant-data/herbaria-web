import { createFileRoute } from '@tanstack/react-router'
import { SpecimenPage } from '@/features/search/components/specimen-page'
import { BASE_API_URL } from '@/config'

export const Route = createFileRoute('/$herbariaId/specimens/$occurrenceID')({
  loader: async ({ params }) => {
    const response = await fetch(`${BASE_API_URL}occurrences/${params.occurrenceID}`)
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
