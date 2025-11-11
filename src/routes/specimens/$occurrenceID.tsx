import { createFileRoute, notFound } from '@tanstack/react-router'
import { SpecimenPage } from '@/features/search/components/specimen-page'
import { BASE_API_URL } from '@/config'
import { Footer } from '@/components/footer'
import { SpecimenNotFound } from '@/features/search/components/specimen-not-found'

export const Route = createFileRoute('/specimens/$occurrenceID')({
  loader: async ({ params }) => {
    const response = await fetch(`${BASE_API_URL}occurrences/${params.occurrenceID}`)
    if (!response.ok) {
      if (response.status === 404) {
        throw notFound()
      }
      throw new Error('Failed to fetch occurrence data')
    }
    return response.json()
  },
  component: OccurrenceDetail,
  notFoundComponent: NotFoundComponent,
})

function NotFoundComponent() {
  const { occurrenceID } = Route.useParams()
  return <SpecimenNotFound occurrenceID={occurrenceID} />
}

function OccurrenceDetail() {
  const occurrence = Route.useLoaderData()
  return (
    <>
      <SpecimenPage occurrence={occurrence} />
      <Footer />
    </>
  )
}
