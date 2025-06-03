import { createFileRoute } from '@tanstack/react-router'
import { useFilterStore } from '@/features/search/stores/use-filters-store'

export const Route = createFileRoute('/search/debug-filters')({
  component: RouteComponent,
})




function RouteComponent() {
  const {
    scientificName,
    floritalyName,
    country,
    locality,
    year,
    month,
    hasCoordinates,
    activeFiltersCount
  } = useFilterStore()

  return (
    <div>
      <h2>Filter Store Values:</h2>
      <pre className='text-xs'>{JSON.stringify({
        scientificName,
        floritalyName,
        country,
        locality,
        year,
        month,
        hasCoordinates,
        activeFiltersCount
      }, null, 2)}</pre>
    </div>
  )
}