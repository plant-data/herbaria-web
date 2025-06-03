import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { MONTHS } from '@/features/search/constants/months'

// Constants
const YEAR_RANGE = { min: 1800, max: 2025 }

// Types


interface FilterGroupProps {
  label: string
  count: number
  children: React.ReactNode
}

interface FilterItemProps {
  index: number
  total: number
  displayValue: string
}

interface TreeLinesProps {
  index: number
  total: number
}

// Component: Tree connection lines
function TreeLines({ index, total }: TreeLinesProps) {
  const isLast = index === total - 1
  
  return (
    <div className="flex-shrink-0 w-4 h-4 mr-1 relative">
      {/* Vertical line (except for last item) */}
      {!isLast && (
        <div className="absolute left-1.5 top-2 w-px h-6 bg-muted-foreground" />
      )}
      {/* Horizontal line */}
      <div className="absolute left-1.5 top-2 w-2 h-px bg-muted-foreground" />
      {/* Vertical connector */}
      <div className={`absolute left-1.5 top-0 w-px bg-muted-foreground ${isLast ? 'h-2' : 'h-4'}`} />
    </div>
  )
}

// Component: Individual filter item with badge
function FilterItem({ index, total, displayValue }: FilterItemProps) {

  return (
    <div className="flex items-center">
      <TreeLines index={index} total={total} />
      <Badge
        variant="secondary"
        className="bg-background dark:bg-input border-input text-xs font-normal hover:bg-background/80 transition-colors"
        tabIndex={-1}
      >
        <span className={`truncate max-w-full`}>{displayValue}</span>
      </Badge>
    </div>
  )
}

// Component: Filter group wrapper
function FilterGroup({ label, count, children }: FilterGroupProps) {
  return (
    <div>
      <div className="font-medium text-xs text-primary mb-1">
        {label} ({count})
      </div>
      <div className="flex flex-col gap-1">
        {children}
      </div>
    </div>
  )
}

export function SelectedFiltersTree() {
  const { t } = useTranslation()
  const {
    scientificNames,
    floritalyNames,
    countries,
    locality,
    years,
    months,
    hasCoordinates,
    activeFiltersCount,
  } = useFilterStore()

  // Memoized calculations
  const hasYearFilter = useMemo(
    () => years[0] !== YEAR_RANGE.min || years[1] !== YEAR_RANGE.max,
    [years]
  )

  const monthNameMap = useMemo(
    () => new Map(MONTHS.map(month => [month.id, t(month.value)])),
    [t]
  )

  const getMonthName = (monthId: number) => 
    monthNameMap.get(monthId) || `Month ${monthId}`

  // Filter configuration
  const filterConfigs = useMemo(() => [
    {
      key: 'scientificNames',
      items: scientificNames,
      label: t('search.filters.scientific-name-label'),
    },
    {
      key: 'floritalyNames',
      items: floritalyNames,
      label: t('search.filters.floritaly-name-label'),
    },
    {
      key: 'countries',
      items: countries,
      label: t('search.filters.country-label'),
    },
    {
      key: 'locality',
      items: locality,
      label: t('search.filters.locality-label'),

    },
  ], [t, scientificNames, floritalyNames, countries, locality])

  if (activeFiltersCount === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        {t('search.filters.no-active-filters')}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className='h-3 w-full'></div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">
          {t('search.filters.active-filters')} ({activeFiltersCount})
        </span>
      </div>
      

      <div className="space-y-1 text-sm">
        {/* Render array-based filters */}
        {filterConfigs.map(config => 
          config.items.length > 0 && (
            <FilterGroup 
              key={config.key}
              label={config.label} 
              count={config.items.length}
            >
              {config.items.map((item, index) => (
                <FilterItem
                  key={item}
                  index={index}
                  total={config.items.length}
                  displayValue={item}
                />
              ))}
            </FilterGroup>
          )
        )}

        {/* Year filter */}
        {hasYearFilter && (
          <FilterGroup label={t('search.filters.year-label')} count={1}>
            <FilterItem
              index={0}
              total={1}
              displayValue={`${years[0]} - ${years[1]}`}
            />
          </FilterGroup>
        )}

        {/* Month filters */}
        {months.length > 0 && (
          <FilterGroup label={t('search.filters.month-label')} count={months.length}>
            {months.map((monthId, index) => (
              <FilterItem
                key={monthId}
                index={index}
                total={months.length}
                displayValue={getMonthName(monthId)}
              />
            ))}
          </FilterGroup>
        )}

        {/* Coordinates filter */}
        {hasCoordinates && (
          <FilterGroup label={t('search.filters.has-coordinates-label')} count={1}>
            <FilterItem
              index={0}
              total={1}
              displayValue={t('common.yes')}
            />
          </FilterGroup>
        )}
      </div>
    </div>
  )
}