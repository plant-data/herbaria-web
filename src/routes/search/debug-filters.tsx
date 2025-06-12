import { createFileRoute } from '@tanstack/react-router'
import { useFilterStore } from '@/features/search/stores/use-filters-store'

export const Route = createFileRoute('/search/debug-filters')({
  component: RouteComponent,
  loader: () => {
    const { setHasCoordinates } = useFilterStore.getState()
    setHasCoordinates(true)
  },
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
    activeFiltersCount,
  } = useFilterStore()

  return (
    <div>
      <p>hasCoordinates true from the loader </p>
      <h2>Filter Store Values:</h2>
      <pre className="text-xs">
        {JSON.stringify(
          {
            scientificName,
            floritalyName,
            country,
            locality,
            year,
            month,
            hasCoordinates,
            activeFiltersCount,
          },
          null,
          2,
        )}
      </pre>
    </div>
  )
}
