import { createFileRoute } from '@tanstack/react-router'
import { useFilterStore } from '@/features/search/stores/use-filters-store'

export const Route = createFileRoute('/$herbariaId/search/debug-filters')({
  component: RouteComponent,
  loader: () => {
    const { setHasCoordinates } = useFilterStore.getState()
    setHasCoordinates(true)
  },
})

function RouteComponent() {
  const {
    scientificName,
    genus,
    floritalyName,
    countryCode,
    locality,
    year,
    month,
    institutionCode,
    hasCoordinates,
    geometry,
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
            genus,

            countryCode,
            locality,
            year,
            month,
            hasCoordinates,
            institutionCode,
            floritalyName,
            geometry,
            activeFiltersCount,
          },
          null,
          2,
        )}
      </pre>
    </div>
  )
}
