import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { SpecimenData } from '@/features/search/types/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSpecimensCount, useSpecimensData } from '@/features/search/api/get-occurrences'
import { Pagination } from '@/features/search/components/pagination'
import { ITEMS_PER_PAGE } from '@/config'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { COUNTRIES } from '@/features/search/constants/countries'

// Helper function to get country name by country code
function getCountryNameByCode(countryCode: string | null): string | null {
  if (!countryCode) return null
  const country = COUNTRIES.find((c) => c.id === countryCode)
  return country ? country.value : null
}

export default function SpecimensGallery({ customFilters = {} }) {
  const { herbariaId } = useParams({ strict: false })
  /* const { skip } = useFilterStore((state) => ({
    skip: state.skip,
  }))
  const { setSkip } = useFilterStore((state) => ({
    setSkip: state.setSkip,
  })) */
  const skip = useFilterStore((state) => state.skip)
  const setSkip = useFilterStore((state) => state.setSkip)
  const { data, isPending } = useSpecimensData(customFilters)
  const { data: countData, isPending: isCountPending } = useSpecimensCount(customFilters)

  return isPending || isCountPending ? (
    <>
      <div className="m-2 h-[50px]"></div>
      <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3 @7xl:grid-cols-4">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
          <DataItemCardSkeleton key={index} />
        ))}
      </div>
    </>
  ) : (
    <>
      <Pagination count={countData.count} skip={skip} limit={ITEMS_PER_PAGE} setSkip={setSkip} />
      <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3 @7xl:grid-cols-4">
        {data.occurrences.map((item: SpecimenData) => (
          <Link
            key={item.occurrenceID}
            to={herbariaId ? '/$herbariaId/specimens/$occurrenceID' : '/specimens/$occurrenceID'}
            params={herbariaId ? { herbariaId, occurrenceID: item.occurrenceID } : { occurrenceID: item.occurrenceID }}
            className="rounded-md"
          >
            <DataItemCard item={item} />
          </Link>
        ))}
      </div>
      <Pagination count={countData.count} skip={skip} limit={ITEMS_PER_PAGE} setSkip={setSkip} />
    </>
  )
}

function DataItemCard({ item }: { item: SpecimenData }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const { t } = useTranslation()

  const countryTranslationKey = getCountryNameByCode(item.countryCode)
  const countryName = countryTranslationKey ? t(countryTranslationKey as any) : '-'

  return (
    <Card className="focus-visible:border-ring focus-visible:ring-ring/50 h-full min-h-40 w-full rounded-md p-1 shadow-xs hover:cursor-pointer hover:bg-muted/50 focus-visible:ring-[3px]">
      <CardContent className="flex min-h-full items-start gap-4 p-0">
        {/* Placeholder Image Area */}
        <div className="bg-muted relative flex h-[150px] w-[110px] shrink-0 items-center justify-center overflow-hidden rounded-sm border-1">
          {!imageLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}
          <img
            className={`object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            src={item.multimedia.filter((media) => media.imageRole === 'primary')[0]?.thumbnailUrl}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </div>

        {/* Text Content Area */}
        <div className="flex min-h-full w-full flex-col space-y-1 pt-4 pr-1">
          <p className="pb-1 text-sm font-semibold">{item.scientificName || 'Unknown Species'}</p>
          <p className="text-muted-foreground text-xs">Country: {countryName}</p>

          <p className="text-muted-foreground text-xs">Date: {item.eventDate ? item.eventDate : '-'}</p>
          <p className="flex-grow"></p>
          <p className="text-muted-foreground pr-1 text-right text-xs">{item.catalogNumber || 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function DataItemCardSkeleton() {
  return (
    <Card className="h-full min-h-40 w-full rounded-md p-1 shadow-xs">
      <CardContent className="flex min-h-full items-start gap-4 p-0">
        {/* Image Skeleton */}
        <div className="bg-muted flex h-[150px] w-[110px] shrink-0 items-center justify-center overflow-hidden rounded-sm border-1">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex min-h-full w-full flex-col space-y-1 pt-4 pr-1">
          <Skeleton className="mb-1 h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex-grow"></div>
          <div className="pr-1 text-right">
            <Skeleton className="ml-auto h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
