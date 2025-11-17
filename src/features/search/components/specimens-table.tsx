import { useMemo } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import type { SpecimenData } from '@/features/search/types/types'
import { Pagination } from '@/features/search/components/pagination'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { useSpecimensCount, useSpecimensData } from '@/features/search/api/get-occurrences'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ITEMS_PER_PAGE } from '@/config'
import { COUNTRIES } from '@/features/search/constants/countries'

// Helper function to get country name from country code
const getCountryName = (countryCode: unknown): string => {
  if (!countryCode || typeof countryCode !== 'string') return '-'
  const country = COUNTRIES.find((c) => c.id === countryCode)
  return country ? country.value : countryCode
}

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
}

const createColumns = (herbariaId?: string, t?: any): Array<ColumnDef<SpecimenData>> => [
  {
    accessorKey: 'catalogNumber',
    header: 'ID',

    cell: ({ row }) => (
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
          <span className="flex h-8 w-7 gap-2">
            <img
              className="object-contain"
              src={row.original.multimedia.filter((media) => media.imageRole === 'primary')[0]?.thumbnailUrl}
              alt=""
            />
          </span>
          {row.getValue('catalogNumber')}
        </span>
      </Link>
    ),
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
  const { data, isPending, error } = useSpecimensData()
  const { data: countData, isPending: isCountPending } = useSpecimensCount()

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

  return isPending || isCountPending ? (
    <TableSkeleton />
  ) : (
    <>
      {/* pagination and select  */}
      {/* <div className="flex items-center justify-between"> */}
      <>
        <Pagination count={countData.count} skip={skip} limit={ITEMS_PER_PAGE} setSkip={setSkip} />
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Settings2 className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                    onSelect={(e) => {
                      e.preventDefault()
                    }}
                  >
                    {column.columnDef.header?.toString() || column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu> */}
      </>
      {/* </div> */}
      {/* table */}
      <div className="overflow-hidden rounded-md border">
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
