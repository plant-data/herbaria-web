import { createFileRoute } from '@tanstack/react-router'
import { SpecimenPage } from '@/features/search/components/specimen-page'
import { BASE_API_URL } from '@/config'
import { Footer } from '@/components/footer'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/$herbariaId/specimens/$occurrenceID')({
  head: ({ params, loaderData }) => {
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
    const response = await fetch(`${BASE_API_URL}occurrences/${params.occurrenceID}`)
    if (!response.ok) {
      throw new Error('Failed to fetch occurrence data')
    }
    return response.json()
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
  return (
    <>
      <SpecimenPage occurrence={occurrence} />
      <Footer></Footer>
    </>
  )
}
