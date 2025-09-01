import { useCallback, useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { Earth, House } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { Link } from '@tanstack/react-router'
import type { PaletteName } from '@/features/search/constants/map-palettes'
import type { SpecimenData } from '@/features/search/types/types'
import { palettes } from '@/features/search/constants/map-palettes'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { useSpecimensCluster, useSpecimensMap, useSpecimensPoint } from '@/features/search/api/get-occurrences'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { MAP_CENTER, ZOOM } from '@/features/search/constants/constants'

type ClusterData = {
  coordinates: [number, number]
  count: number
  gridCode?: string
  clusterCode?: string
}
type PaletteFn = (count: number) => string

const INITIAL_VIEW_STATE = {
  center: MAP_CENTER,
  zoom: ZOOM,
}

function MapEventHandler() {
  const { setZoom, setBbox, setMapCenter } = useFilterStore(
    useShallow((state) => ({
      setZoom: state.setZoom,
      setBbox: state.setBbox,
      setMapCenter: state.setMapCenter,
    })),
  )
  const map = useMap()
  const updateFilters = useCallback(() => {
    const bounds = map.getBounds()
    const zoom = map.getZoom()
    const center = map.getCenter()
    setZoom(zoom)
    setBbox([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()])
    setMapCenter([center.lat, center.lng])
  }, [map, setZoom, setBbox, setMapCenter])
  useEffect(() => {
    map.whenReady(updateFilters)
  }, [map, updateFilters])
  useMapEvents({ moveend: updateFilters, zoomend: updateFilters })
  return null
}

function MapControls() {
  const map = useMap()
  const handleResetView = () => map.setView(INITIAL_VIEW_STATE.center, INITIAL_VIEW_STATE.zoom)
  const handleWorldView = () => map.setView([20, 5], 2)
  return (
    <div className="absolute top-20 left-3 z-[1000] flex flex-col gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={handleResetView}
        className="size-[30px] rounded-[3px] bg-white text-xs ring-2 ring-gray-400"
        title="Reset to initial view"
      >
        <House className="size-4" />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleWorldView}
        className="size-[30px] rounded-[3px] bg-white text-xs ring-2 ring-gray-400"
        title="Show world view"
      >
        <Earth className="size-4" />
      </Button>
    </div>
  )
}

function ColorLegend({ palette }: { palette: PaletteFn }) {
  const ranges = [
    { label: '> 100', value: 101 },
    { label: '51-100', value: 75 },
    { label: '21-50', value: 35 },
    { label: '11-20', value: 15 },
    { label: '6-10', value: 8 },
    { label: '1-5', value: 3 },
  ]
  return (
    <Card className="rounded-sm p-2.5 shadow-xs">
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-4">
          {ranges.map((range, index) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <div
                className="h-4 w-4 rounded-sm border border-gray-300"
                style={{ backgroundColor: palette(range.value) }}
              />
              <span className="text-gray-700">{range.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PointPopupContent({ coordinates, count }: { coordinates: [number, number]; count: number }) {
  const [skip, setSkip] = useState(0)

  const { data, isPending, error } = useSpecimensPoint({
    customFilters: {
      decimalLatitude: coordinates[1],
      decimalLongitude: coordinates[0],
    },
    customSkip: skip,
  })

  if (isPending) return <div>Loading details...</div>
  if (error) return <div className="text-red-500">Error fetching details.</div>
  if (!data?.occurrences?.length) return <div>No specimen details found.</div>

  return (
    <div className="min-w-[300px] text-sm">
      <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-2">
        {data.occurrences.map((occ: SpecimenData) => (
          <li key={occ.occurrenceID}>
            <span>{occ.scientificName || 'Unknown Species'}</span>{' '}
            <Link className="text-blue-400" to="/specimens/$occurrenceID" params={{ occurrenceID: occ.occurrenceID }}>
              ({occ.occurrenceID})
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <Button onClick={() => setSkip((prev) => Math.max(0, prev - 10))} disabled={skip === 0}>
          Previous
        </Button>
        <span className="text-xs text-gray-500">
          Showing {skip + 1}-{Math.min(skip + 10, count)} of {count}
        </span>
        <Button onClick={() => setSkip((prev) => prev + 10)} disabled={skip + 10 >= count}>
          Next
        </Button>
      </div>
    </div>
  )
}

function ClusterPopupContent({
  gridCode,
  clusterCode,
  count,
}: {
  gridCode: string
  clusterCode: string
  count: number
}) {
  const [skip, setSkip] = useState(0)

  const { data, isPending, error } = useSpecimensCluster({
    customFilters: {
      gridCode,
      clusterCode,
    },
    customSkip: skip,
  })

  if (isPending) return <div>Loading details...</div>
  if (error) return <div className="text-red-500">Error fetching details.</div>
  if (!data?.occurrences?.length) return <div>No specimen details found.</div>

  return (
    <div className="min-w-[300px] text-sm">
      <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-2">
        {data.occurrences.map((occ: SpecimenData) => (
          <li key={occ.occurrenceID}>
            <span>{occ.scientificName || 'Unknown Species'}</span>{' '}
            <Link className="text-blue-400" to="/specimens/$occurrenceID" params={{ occurrenceID: occ.occurrenceID }}>
              ({occ.occurrenceID})
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <Button onClick={() => setSkip((prev) => Math.max(0, prev - 10))} disabled={skip === 0}>
          Previous
        </Button>
        <span className="text-xs text-gray-500">
          Showing {skip + 1}-{Math.min(skip + 10, count)} of {count}
        </span>
        <Button onClick={() => setSkip((prev) => prev + 10)} disabled={skip + 10 >= count}>
          Next
        </Button>
      </div>
    </div>
  )
}

// Simplified markers component that works at all zoom levels
function LeafletMarkers({
  clusters,
  onMarkerClick,
  palette,
  paletteName,
}: {
  clusters: Array<ClusterData>
  onMarkerClick: (cluster: ClusterData) => void
  palette: PaletteFn
  paletteName: string
}) {
  const zoom = useFilterStore((state) => state.zoom)

  // Calculate marker radius based on zoom level and count
  const getMarkerRadius = (count: number, zoom: number) => {
    switch (zoom) {
      case 2:
        return 1
      case 3:
        return 2
      case 4:
        return 2
      case 5:
        return 2
      case 6:
        return 2
      case 7:
        return 1.5
      case 8:
        return 1.5
      case 9:
        return 1.5
      case 10:
        return 1.5
      case 11:
        return 1.5
      case 12:
        return 1.5
      default:
        return 4
    }
  }

  return (
    <>
      {clusters.map((cluster, index) => {
        const [lng, lat] = cluster.coordinates
        if (isNaN(lat) || isNaN(lng)) return null

        const markerColor = palette(cluster.count)
        const radius = getMarkerRadius(cluster.count, zoom)

        return (
          <CircleMarker
            key={`${lat}-${lng}-${index}-${paletteName}`}
            center={[lat, lng]}
            radius={radius}
            fillColor={markerColor}
            color={markerColor}
            weight={1}
            opacity={0.8}
            fillOpacity={0.6}
            eventHandlers={{
              click: () => {
                onMarkerClick(cluster)
              },
            }}
          />
        )
      })}
    </>
  )
}

function SpecimenPointDialog({
  cluster,
  isOpen,
  onClose,
}: {
  cluster: ClusterData
  isOpen: boolean
  onClose: () => void
}) {
  const isPoint = cluster.gridCode === undefined && cluster.clusterCode === undefined
  const title = isPoint ? `Specimens (${cluster.count})` : `Cluster Specimens (${cluster.count})`

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {isPoint ? (
          <PointPopupContent coordinates={cluster.coordinates} count={cluster.count} />
        ) : (
          <ClusterPopupContent gridCode={cluster.gridCode!} clusterCode={cluster.clusterCode!} count={cluster.count} />
        )}
      </DialogContent>
    </Dialog>
  )
}

// Main component with simplified rendering
export function SpecimensMap() {
  const { zoom, mapCenter } = useFilterStore(useShallow((state) => ({
      zoom: state.zoom,
      mapCenter: state.mapCenter,
    })), )
  const { data, isPending, error } = useSpecimensMap()
  const [activePalette, setActivePalette] = useState<PaletteName>('Classic')

  const [selectedCluster, setSelectedCluster] = useState<ClusterData | null>(null)

  const layerData = useMemo(() => {
    if (!data?.clusters) return []
    return data.clusters.filter((c: ClusterData) => !isNaN(c.coordinates[0]) && !isNaN(c.coordinates[1]))
  }, [data?.clusters])

  if (isPending) return <MapSkeleton />
  if (error) return <div className="flex h-[50vh] items-center justify-center text-red-500 md:h-[70vh]">Error.</div>

  return (
    <>
      <div className="relative mt-6 h-[50vh] w-full overflow-hidden rounded-lg md:h-[70vh]">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          zoomControl={true}
        >
          <TileLayer
            url="https://tile.gbif.org/3857/omt/{z}/{x}/{y}@2x.png?style=gbif-geyser-en"
            attribution='© <a href="https://www.gbif.org/citation-guidelines">GBIF</a>'
          />
          <MapEventHandler />
          <MapControls />
          {layerData.length > 0 && (
            <LeafletMarkers
              clusters={layerData}
              onMarkerClick={setSelectedCluster}
              palette={palettes[activePalette]}
              paletteName={activePalette}
            />
          )}
        </MapContainer>

        {selectedCluster && (
          <SpecimenPointDialog
            cluster={selectedCluster}
            isOpen={!!selectedCluster}
            onClose={() => setSelectedCluster(null)}
          />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-4">
        <Select value={activePalette} onValueChange={(value: PaletteName) => setActivePalette(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a palette" />
          </SelectTrigger>
          <SelectContent className="z-[999999]">
            {Object.keys(palettes).map((paletteName) => (
              <SelectItem key={paletteName} value={paletteName}>
                {paletteName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ColorLegend palette={palettes[activePalette]} />
      </div>
    </>
  )
}

function MapSkeleton() {
  return (
    <>
      <div className="relative mt-6 h-[50vh] w-full overflow-hidden rounded-lg border border-gray-200 @sm/mainresult:h-[70vh]">
        {/* Main map skeleton */}
        <div className="h-full w-full">
          <Skeleton className="h-full w-full" />

          {/* Mock map controls */}
          <div className="absolute top-20 left-3 z-10 flex flex-col gap-2">
            <Skeleton className="size-[30px] rounded-[3px]" />
            <Skeleton className="size-[30px] rounded-[3px]" />
          </div>

          {/* Mock map markers scattered across the map */}
          <div className="absolute inset-0">
            <div className="absolute top-[20%] left-[25%]">
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
            <div className="absolute top-[35%] left-[45%]">
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="absolute top-[15%] left-[60%]">
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>
            <div className="absolute top-[50%] left-[30%]">
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
            <div className="absolute top-[40%] left-[70%]">
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="absolute top-[65%] left-[20%]">
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
            <div className="absolute top-[70%] left-[55%]">
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>
            <div className="absolute top-[25%] left-[80%]">
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="absolute top-[80%] left-[40%]">
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
            <div className="absolute top-[60%] left-[75%]">
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton for controls below the map */}
      <div className="mt-2 flex items-center justify-between">
        {/* Palette selector skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Color legend skeleton */}
        <Card className="rounded-sm p-2.5 shadow-xs">
          <CardContent className="p-0">
            <div className="flex flex-wrap gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
