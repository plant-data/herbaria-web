import { useMemo, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Image } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { SpecimenData } from '@/features/search/types/types'
import { Pagination } from '@/features/search/components/pagination'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { useSpecimensCount, useSpecimensData } from '@/features/search/api/get-occurrences'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LoadingBadge } from '@/features/search/components/loading-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ITEMS_PER_PAGE } from '@/config'
import { COUNTRIES } from '@/features/search/constants/countries'

// helper function to get country name from country code
const getCountryName = (countryCode: unknown): string => {
  if (!countryCode || typeof countryCode !== 'string') return '-'
  const country = COUNTRIES.find((c) => c.id === countryCode)
  return country ? country.value : countryCode
}

function SpecimenImage({ thumbnail, alt }: { thumbnail?: string; alt: string }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  if (!thumbnail) {
    return <Image className="h-full w-full text-gray-300" />
  }

  return (
    <div className="bg-muted relative flex h-full w-full items-center justify-center overflow-hidden rounded-xs">
      {!imageLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}
      <img
        className={`h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        src={thumbnail}
        alt={alt}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(false)}
      />
    </div>
  )
}

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
}

const createColumns = (herbariaId?: string, t?: any): Array<ColumnDef<SpecimenData>> => [
  {
    accessorKey: 'catalogNumber',
    header: 'ID',

    cell: ({ row }) => {
      const thumbnail = row.original.multimedia.find((media) => media.imageRole === 'primary')?.thumbnailUrl
      return (
        <Link
          to={herbariaId ? '/$herbariaId/specimens/$occurrenceID' : '/specimens/$occurrenceID'}
          params={
            herbariaId
              ? { herbariaId, occurrenceID: row.original.occurrenceID }
              : { occurrenceID: row.original.occurrenceID }
          }
          className="text-blue-500 hover:underline"
        >
          <span className="flex min-w-50 items-center gap-2">
            <span className="flex h-8 w-6 gap-2">
              <SpecimenImage key={thumbnail} thumbnail={thumbnail} alt={`Specimen ${row.getValue('catalogNumber')}`} />
            </span>
            {row.getValue('catalogNumber')}
          </span>
        </Link>
      )
    },
  },
  {
    accessorKey: 'scientificName',
    header: 'Name',
  },
  {
    accessorKey: 'eventDate',
    header: 'Date',
  },
  {
    accessorKey: 'locality',
    header: 'Locality',
    cell: ({ row }) => (
      <div className="w-[300px] truncate" title={row.getValue('locality')}>
        {row.getValue('locality')}
      </div>
    ),
  },
  {
    accessorKey: 'countryCode',
    header: 'Country',
    cell: ({ row }) => {
      const countryName = getCountryName(row.original.countryCode)
      return countryName === '-' ? '-' : t?.(countryName as any) || countryName
    },
  },
  {
    accessorKey: 'decimalLatitude',
    header: 'Latitude',
  },
  {
    accessorKey: 'decimalLongitude',
    header: 'Longitude',
  },
  {
    accessorKey: 'floritalyName',
    header: 'Name in FlorItaly',
  },
  {
    accessorKey: 'recordedBy',
    header: 'Recorded By',
  },
  {
    accessorKey: 'identifiedBy',
    header: 'Identified By',
  },
]

export function SpecimensTable() {
  const { herbariaId } = useParams({ strict: false })
  const { t } = useTranslation()
  const skip = useFilterStore((state) => state.skip)
  const setSkip = useFilterStore((state) => state.setSkip)
  const { data, isPending, error, isFetching } = useSpecimensData()
  const { data: countData, isPending: isCountPending, error: errorCount } = useSpecimensCount()

  /* const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    recordedBy: false,
    identifiedBy: false,
    country: false,
  }) */

  const columns = useMemo(() => createColumns(herbariaId, t), [herbariaId, t])

  const table = useReactTable({
    data: data?.occurrences ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    /* state: {
      columnVisibility,
    }, */
    /* onColumnVisibilityChange: setColumnVisibility, */
    debugTable: true,
  })

  if (error || errorCount) {
    return <div>Error loading data</div> // Or throw to let the boundary handle it cleanly
  }
  if (isPending || isCountPending) {
    return <TableSkeleton />
  }
  return (
    <>
      {/* pagination and select  */}
      {/* <div className="flex items-center justify-between"> */}
      <>
        <Pagination count={countData.count} skip={skip} limit={ITEMS_PER_PAGE} setSkip={setSkip} />
      </>
      {/* table */}
      <div className="relative overflow-hidden rounded-md border">
        {isFetching && <LoadingBadge className="absolute top-2 left-2 z-10" />}
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="dark:bg-card">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="min-w-40 py-2" key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination count={countData.count} skip={skip} limit={ITEMS_PER_PAGE} setSkip={setSkip} />
    </>
  )
}

function TableSkeleton() {
  const columns = useMemo(() => createColumns(), [])

  return (
    <>
      <div className="m-2 h-[50px]"></div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="dark:bg-card">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell className="min-w-40 py-2" key={colIndex}>
                    {colIndex === 0 ? (
                      // First column with image and ID
                      <div className="flex min-w-50 items-center gap-2">
                        <div className="flex h-8 w-7 gap-2">
                          <Skeleton className="h-8 w-7" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ) : (
                      <Skeleton className="h-4 w-full" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="m-2 h-[50px]"></div>
    </>
  )
}
