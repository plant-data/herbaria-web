import { createFileRoute, notFound } from '@tanstack/react-router'
import { SpecimenPage } from '@/features/search/components/specimen-page'
import { BASE_API_URL } from '@/config'
import { Footer } from '@/components/footer'
import { SpecimenNotFound } from '@/features/search/components/specimen-not-found'
import { Skeleton } from '@/components/ui/skeleton'

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
  pendingComponent: () => (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[354px_1fr]">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  ),
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
