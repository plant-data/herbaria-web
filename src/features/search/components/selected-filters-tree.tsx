import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import {
  MAX_YEAR,
  MIN_YEAR,
  MONTHS,
  HERBARIA,
} from '@/features/search/constants/constants'
import { COUNTRIES } from '@/features/search/constants/countries'

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

interface FilterConfig {
  key: string
  label: string
  items: Array<any>
  displayValue?: (item: any, index?: number) => string
  condition?: () => boolean
}

// Component: Tree connection lines
function TreeLines({ index, total }: TreeLinesProps) {
  const isLast = index === total - 1

  return (
    <div className="relative mr-1 h-4 w-4 flex-shrink-0">
      {/* Vertical line (except for last item) */}
      {!isLast && (
        <div className="bg-muted-foreground absolute top-2 left-1.5 h-6 w-px" />
      )}
      {/* Horizontal line */}
      <div className="bg-muted-foreground absolute top-2 left-1.5 h-px w-2" />
      {/* Vertical connector */}
      <div
        className={`bg-muted-foreground absolute top-0 left-1.5 w-px ${isLast ? 'h-2' : 'h-4'}`}
      />
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
        className="bg-background dark:bg-input border-input hover:bg-background/80 text-xs font-normal transition-colors"
        tabIndex={-1}
      >
        <span className={`max-w-[15rem] truncate`}>{displayValue}</span>
      </Badge>
    </div>
  )
}

// Component: Filter group wrapper
function FilterGroup({ label, count, children }: FilterGroupProps) {
  return (
    <div>
      <div className="text-primary mb-1 text-sm font-medium">
        {label} ({count})
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

export function SelectedFiltersTree() {
  const { t } = useTranslation()
  const {
    scientificName,
    floritalyName,
    country,
    countryCode,
    locality,
    year,
    month,
    institutionCode,
    hasCoordinates,
    activeFiltersCount,
  } = useFilterStore(
  )

  // Memoized month name mapping
  const monthNameMap = useMemo(
    () => new Map(MONTHS.map((month) => [month.id, t(month.value)])),
    [t],
  )
  const herbariaMap = useMemo(
    () =>
      new Map(HERBARIA.map((herbarium) => [herbarium.id, t(herbarium.value)])),
    [t],
  )
  const countryCodeMap = useMemo(
    () => new Map(COUNTRIES.map((country) => [country.id, t(country.value)])),
    [t],
  )
  // Unified filter configuration
  const filterConfigs: Array<FilterConfig> = useMemo(
    () => [
      {
        key: 'scientificName',
        items: scientificName,
        label: t('search.filters.scientific-name-label'),
      },
      {
        key: 'floritalyName',
        items: floritalyName,
        label: t('search.filters.floritaly-name-label'),
      },
      {
        key: 'country',
        items: country,
        label: t('search.filters.country-label'),
      },
      {
        key: 'countryCode',
        items: countryCode,
        label: t('search.filters.country-code-label'),
        displayValue: (countryCode: string) =>
          countryCodeMap.get(countryCode) || `Country Code ${countryCode}`,
      },
      {
        key: 'locality',
        items: locality,
        label: t('search.filters.locality-label'),
      },
      {
        key: 'year',
        items: year,
        label: t('search.filters.year-label'),
        condition: () => year[0] !== MIN_YEAR || year[1] !== MAX_YEAR,
      },
      {
        key: 'month',
        items: month,
        label: t('search.filters.month-label'),
        displayValue: (monthId: number) =>
          monthNameMap.get(monthId) || `Month ${monthId}`,
      },
      {
        key: 'institutionCode',
        items: institutionCode,
        label: t('search.filters.institution-code-label'),
        displayValue: (herbariumId: string) =>
          herbariaMap.get(herbariumId) || `Herbarium ${herbariumId}`,
      },
      {
        key: 'hasCoordinates',
        items: hasCoordinates ? [hasCoordinates] : [],
        label: t('search.filters.has-coordinates-label'),
        displayValue: () => t('common.yes'),
      },
    ],
    [
      t,
      scientificName,
      floritalyName,
      country,
      countryCode,
      locality,
      year,
      month,
      hasCoordinates,
    ],
  )

  if (activeFiltersCount === 0) {
    return (
      <div className="text-muted-foreground py-6 text-center text-sm">
        {t('search.filters.no-active-filters')}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="h-3 w-full"></div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">
          {t('search.filters.active-filters')} ({activeFiltersCount})
        </span>
      </div>

      <div className="space-y-1 text-sm">
        {filterConfigs.map((config) => {
          // Check if filter should be displayed
          const shouldDisplay = config.condition
            ? config.condition()
            : config.items.length > 0

          if (!shouldDisplay) return null

          return (
            <FilterGroup
              key={config.key}
              label={config.label}
              count={config.items.length}
            >
              {config.items.map((item, index) => (
                <FilterItem
                  key={
                    typeof item === 'string' ? item : `${config.key}-${index}`
                  }
                  index={index}
                  total={config.items.length}
                  displayValue={
                    config.displayValue
                      ? config.displayValue(item, index)
                      : String(item)
                  }
                />
              ))}
            </FilterGroup>
          )
        })}
      </div>
    </div>
  )
}
