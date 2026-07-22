import { createFileRoute, notFound } from '@tanstack/react-router'
import { SpecimenPage } from '@/features/search/components/specimen-page'
import { fetchSpecimenById } from '@/features/search/api/local-backend'
import { Footer } from '@/components/footer'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/$herbariaId/specimens/$occurrenceID')({
  head: ({ params }) => {
    const occurrenceID = params.occurrenceID
    const title = `Specimen ${occurrenceID} - Herbaria`
    const description = `View details for herbarium specimen ${occurrenceID}. Scientific data, images, and collection information.`

    return {
      meta: [
        {
          title,
        },
        {
          name: 'description',
          content: description,
        },
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: description,
        },
      ],
    }
  },
  loader: async ({ params }) => {
    // The public API has no by-id route; fetchSpecimenById does a `q` lookup.
    const specimen = await fetchSpecimenById(params.occurrenceID)
    if (!specimen) {
      throw notFound()
    }
    return specimen
  },
  component: OccurrenceDetail,
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

function OccurrenceDetail() {
  const occurrence = Route.useLoaderData()
  if (!occurrence) {
    return null
  }
  return (
    <>
      <SpecimenPage occurrence={occurrence} />
      <Footer></Footer>
    </>
  )
}
