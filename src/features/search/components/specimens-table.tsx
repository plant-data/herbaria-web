import { useState, useMemo } from 'react'
import { Settings2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { SpecimenData } from '@/features/search/types/types'
import { Pagination } from '@/features/search/components/pagination'
import useSearchOccurrences from '@/features/search/api/get-occurrences'
import { usePrepareFilters } from '@/features/search/hooks/use-prepare-filters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ITEMS_PER_PAGE } from '@/config'

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
}


const createColumns = (): Array<ColumnDef<SpecimenData>> => [

  {
    accessorKey: 'occurrenceID',
    header: 'ID',

    cell: ({ row }) => (
      <Link
        to={`/${row.original.occurrenceID}`}
        className="text-blue-500 hover:underline"
      >
        <span className="flex gap-2 items-center min-w-50">
          <span className="flex gap-2 w-7 h-8 ">
          <img
            className='object-contain'
            src={`http://137.204.21.175:8000/unsafe/110x150${row.original.multimedia[0].identifier}`}
            alt=""
          />
        </span>
          {row.getValue('occurrenceID')}
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
    accessorKey: 'locality',
    header: 'Locality',
  },
  {
    accessorKey: 'recordedBy',
    header: 'Recorded By',
  },
  {
    accessorKey: 'identifiedBy',
    header: 'Identified By',
  },
  {
    accessorKey: 'country',
    header: 'Country',
  },
]

export function SpecimensTable() {
  const { filters, skip, setSkip } = usePrepareFilters()
  const { data, isPending, error } = useSearchOccurrences(
    filters,
    { scientificName: 'asc' },
    ITEMS_PER_PAGE,
    skip,
  )

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    recordedBy: false,
    identifiedBy: false,
    country: false,
  })

  const columns = useMemo(() => createColumns(), [])

  const table = useReactTable({
    data: data?.occurrences ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    debugTable: true,
  })

  return isPending ? (
    <div>'Loading...'</div>
  ) : (
    <div className="@container px-4 py-2  md:px-6">
      {/* pagination and select  */}
      <div className="flex items-center justify-between">
        <Pagination
          count={data.count}
          skip={skip}
          limit={ITEMS_PER_PAGE}
          setSkip={setSkip}
        />
        <DropdownMenu>
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
        </DropdownMenu>
      </div>
      {/* table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="py-2 min-w-40" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
