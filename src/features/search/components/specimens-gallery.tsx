import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card' 
import { Skeleton } from '@/components/ui/skeleton'
import useSearchOccurrences from '@/features/search/api/get-occurrences'
import { usePrepareFilters } from '@/features/search/hooks/use-prepare-filters'
import { Pagination } from '@/features/search/components/pagination'
import { ITEMS_PER_PAGE } from '@/config'

export default function SpecimensGallery() {
  const { filters, skip, setSkip } = usePrepareFilters()

  const { data, isPending, error } = useSearchOccurrences(
    filters,
    { scientificName: 'asc' },
    ITEMS_PER_PAGE,
    skip,
  )

  return isPending ? (
    <div className="@container px-4 py-2  md:px-6">
      <div className="h-[50px] m-2"></div>
      <div className="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 gap-4">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
          <DataItemCardSkeleton key={index} />
        ))}
      </div>
    </div>
  ) : (
    <div className="@container px-4 py-2  md:px-6">
      <Pagination
        count={data.count}
        skip={skip}
        limit={ITEMS_PER_PAGE}
        setSkip={setSkip}
      />
      <div className="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 gap-4">
        {data.occurrences.map((item) => (
          <Link
            key={item.occurrenceID}
            to={`/specimens/${item.occurrenceID}`}
            className="rounded-md"
          >
            <DataItemCard item={item} />
          </Link>
        ))}
      </div>
      <Pagination
        count={data.count}
        skip={skip}
        limit={ITEMS_PER_PAGE}
        setSkip={setSkip}
      />
    </div>
  )
}

// deve diventare un pick
interface DataItem {
  catalogNumber: string
  scientificName: string | null
  eventDate: string | null
  occurrenceID: string // Good for React key
}

interface DataItemCardProps {
  item: DataItem
}

function DataItemCard({ item }: DataItemCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  return (
    <Card className="w-full h-full min-h-40 rounded-md shadow-xs p-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:cursor-pointer">
      <CardContent className="p-0 flex min-h-full items-start gap-4">
        {/* Placeholder Image Area */}
        <div className="w-[110px] h-[150px] border-1 overflow-hidden bg-muted rounded-sm flex items-center justify-center shrink-0 relative">
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <img
            className={`object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            src={`http://137.204.21.175:8000/unsafe/110x150${item.multimedia[0].identifier}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)} // Hide skeleton even if image fails to load
          />
        </div>

        {/* Text Content Area */}
        <div className="min-h-full w-full pt-4 pr-1 flex flex-col space-y-1">
          <p className="text-sm font-semibold pb-1">
            {item.scientificName || 'Unknown Species'}
          </p>
          <p className="text-xs text-muted-foreground">Country: Italy</p>

          <p className="text-xs text-muted-foreground">
            Date: {item.eventDate ? item.eventDate : 'Not specified'}
          </p>
          <p className="flex-grow"></p>
          <p className="text-xs text-muted-foreground text-right pr-1">
            {item.catalogNumber || 'N/A'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function DataItemCardSkeleton() {
  return (
    <Card className="w-full h-full min-h-40 rounded-md shadow-xs p-1">
      <CardContent className="p-0 flex min-h-full items-start gap-4">
        {/* Image Skeleton */}
        <div className="w-[110px] h-[150px] border-1 overflow-hidden bg-muted rounded-sm flex items-center justify-center shrink-0">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="min-h-full w-full pt-4 pr-1 flex flex-col space-y-1">
          <Skeleton className="h-4 w-3/4 mb-1" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex-grow"></div>
          <div className="text-right pr-1">
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
