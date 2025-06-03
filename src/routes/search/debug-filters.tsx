import { createFileRoute } from '@tanstack/react-router'
import { useFilterStore } from '@/features/search/stores/use-filters-store'

export const Route = createFileRoute('/search/debug-filters')({
  component: RouteComponent,
})




function RouteComponent() {
  const {
    scientificNames,
    floritalyNames,
    countries,
    locality,
    years,
    months,
    hasCoordinates,
    activeFiltersCount
  } = useFilterStore()

  return (
    <div>
      <h2>Filter Store Values:</h2>
      <pre className='text-xs'>{JSON.stringify({
        scientificNames,
        floritalyNames,
        countries,
        locality,
        years,
        months,
        hasCoordinates,
        activeFiltersCount
      }, null, 2)}</pre>
    </div>
  )
}