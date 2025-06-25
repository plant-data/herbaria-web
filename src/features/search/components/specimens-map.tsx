import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import { Earth, House } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { Link } from '@tanstack/react-router'
import type { PaletteName } from '@/features/search/constants/map-palettes'
import type { SpecimenData } from '@/features/search/types/types'
import { palettes } from '@/features/search/constants/map-palettes'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import {
  useSpecimensMap,
  useSpecimensPoint,
} from '@/features/search/api/get-occurrences'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

type ClusterData = { coordinates: [number, number]; count: number }
type PaletteFn = (count: number) => string

const INITIAL_VIEW_STATE = {
  center: [41.902782, 12.496366] as [number, number],
  zoom: 5,
}

class CanvasMarkerLayer extends L.Layer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private clusters: Array<ClusterData> = []
  private getCircleColor: PaletteFn

  constructor(options?: L.LayerOptions & { initialPalette: PaletteFn }) {
    super(options)
    this.canvas = document.createElement('canvas')
    this.canvas.style.imageRendering = 'pixelated'
    this.ctx = this.canvas.getContext('2d')!
    this.getCircleColor = options?.initialPalette || palettes.Classic
  }

  public updatePalette(newPalette: PaletteFn): void {
    this.getCircleColor = newPalette
    this.redraw()
  }

  onAdd(map: L.Map): this {
    map.getPanes().overlayPane.appendChild(this.canvas)
    map.on('viewreset zoom movend resize', this.redraw, this)
    this.redraw()
    return this
  }

  onRemove(map: L.Map): this {
    map.getPanes().overlayPane.removeChild(this.canvas)
    map.off('viewreset zoom movend resize', this.redraw, this)
    return this
  }

  updateData(clusters: Array<ClusterData>): void {
    this.clusters = clusters
    this.redraw()
  }

  private redraw = (): void => {
    const map = this._map
    if (!map) return
    const size = map.getSize()
    const bounds = map.getBounds()
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = size.x * dpr
    this.canvas.height = size.y * dpr
    this.canvas.style.width = `${size.x}px`
    this.canvas.style.height = `${size.y}px`
    this.ctx.scale(dpr, dpr)
    const topLeft = map.latLngToLayerPoint(bounds.getNorthWest())
    L.DomUtil.setPosition(this.canvas, topLeft)
    this.ctx.clearRect(0, 0, size.x, size.y)
    const mapZoom = map.getZoom()
    const markerSize = (baseSize: number, factor: number) => {
      if (factor > 7) {
        return baseSize * Math.max(0.5, factor / 15)
      } else if (factor == 5) {
        return baseSize * Math.max(factor / 9)
      } else if (factor > 3) {
        return baseSize * Math.max(0.7, Math.min(2, factor / 10))
      } else {
        return baseSize * Math.max(factor / 6)
      }
    }

    this.clusters.forEach((cluster) => {
      const [lng, lat] = cluster.coordinates
      if (!bounds.contains([lat, lng])) return
      const point = map.latLngToLayerPoint(new L.LatLng(lat, lng))
      const x = point.x - topLeft.x
      const y = point.y - topLeft.y

      this.ctx.fillStyle = this.getCircleColor(cluster.count)
      this.ctx.globalAlpha = 0.8

      const size = markerSize(8, mapZoom)
      const roundedX = Math.round(x - size / 2)
      const roundedY = Math.round(y - size / 2)
      this.ctx.fillRect(roundedX, roundedY, size, size)
    })
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
  }
}

function CanvasMarkers({
  clusters,
  palette,
}: {
  clusters: Array<ClusterData>
  palette: PaletteFn
}) {
  const map = useMap()
  const layerRef = useRef(new CanvasMarkerLayer({ initialPalette: palette }))

  useEffect(() => {
    const layer = layerRef.current
    map.addLayer(layer)
    return () => {
      map.removeLayer(layer)
    }
  }, [map])

  useEffect(() => {
    layerRef.current.updateData(clusters)
  }, [clusters])

  useEffect(() => {
    layerRef.current.updatePalette(palette)
  }, [palette])

  return null
}

function MapEventHandler() {
  const { setZoom, setBbox } = useFilterStore(
    useShallow((state) => ({
      setZoom: state.setZoom,
      setBbox: state.setBbox,
    })),
  )
  const map = useMap()
  const updateFilters = useCallback(() => {
    const bounds = map.getBounds()
    const zoom = map.getZoom()
    setZoom(zoom)
    setBbox([
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ])
  }, [map, setZoom, setBbox])
  useEffect(() => {
    map.whenReady(updateFilters)
  }, [map, updateFilters])
  useMapEvents({ moveend: updateFilters, zoomend: updateFilters })
  return null
}

function MapControls() {
  const map = useMap()
  const handleResetView = () =>
    map.setView(INITIAL_VIEW_STATE.center, INITIAL_VIEW_STATE.zoom)
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

function SpecimenPopupContent({
  decimalLatitude,
  decimalLongitude,
  count,
}: {
  decimalLatitude: number
  decimalLongitude: number
  count: number
}) {
  const [skip, setSkip] = useState(0)
  const { data, isPending, error } = useSpecimensPoint({
    customFilters: { decimalLatitude, decimalLongitude },
    customSkip: skip,
  })

  if (isPending) return <div>Loading details...</div>
  if (error) return <div className="text-red-500">Error fetching details.</div>
  if (!data?.occurrences?.length)
    return <div>No specimen details found at this point.</div>

  return (
    <div className="min-w-[300px] text-sm">
      <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-2">
        {data.occurrences.map((occ: SpecimenData) => (
          <li key={occ.occurrenceID}>
            <span>{occ.scientificName || 'Unknown Species'}</span>{' '}
            <Link
              className="text-blue-400"
              to="/specimens/$occurrenceID"
              params={{ occurrenceID: occ.occurrenceID }}
            >
              ({occ.occurrenceID})
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <Button
          onClick={() => setSkip((prev) => Math.max(0, prev - 10))}
          disabled={skip === 0}
        >
          Previous
        </Button>
        <span className="text-xs text-gray-500">
          Showing {skip + 1}-{Math.min(skip + 10, count)} of {count}
        </span>
        <Button
          onClick={() => setSkip((prev) => prev + 10)}
          disabled={skip + 10 >= count}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// MODIFIED: `SimpleMarkers` now uses a dynamic key to force re-renders.
// ============================================================================
function SimpleMarkers({
  clusters,
  onMarkerClick,
  palette,
  paletteName, // Accept the palette name string as a prop
}: {
  clusters: Array<ClusterData>
  onMarkerClick: (cluster: ClusterData) => void
  palette: PaletteFn
  paletteName: string // Add paletteName to the type definition
}) {
  const zoom = useFilterStore((state) => state.zoom)

  if (zoom <= 12) return null

  return (
    <>
      {clusters.map((cluster, index) => {
        const [lng, lat] = cluster.coordinates
        if (isNaN(lat) || isNaN(lng)) return null

        const markerColor = palette(cluster.count)

        return (
          <CircleMarker
            // CRITICAL CHANGE: The paletteName is added to the key.
            // When the palette changes, the key changes, forcing React
            // to unmount the old marker and mount a new one with the new color.
            key={`${lat}-${lng}-${index}-${paletteName}`}
            center={[lat, lng]}
            radius={6}
            fillColor={markerColor}
            color={markerColor}
            weight={2}
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
  point,
  isOpen,
  onClose,
}: {
  point: ClusterData
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Specimens ({point.count})</DialogTitle>
        </DialogHeader>
        <SpecimenPopupContent
          decimalLatitude={point.coordinates[1]}
          decimalLongitude={point.coordinates[0]}
          count={point.count}
        />
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// MODIFIED: The main SpecimensMap component passes the palette name.
// ============================================================================
export function SpecimensMap() {
  const { data, isPending, error } = useSpecimensMap()
  const [activePalette, setActivePalette] = useState<PaletteName>('Classic')
  const zoom = useFilterStore((state) => state.zoom)

  const [selectedPoint, setSelectedPoint] = useState<ClusterData | null>(null)

  const layerData = useMemo(() => {
    if (!data?.clusters) return []
    return data.clusters.filter(
      (c: ClusterData) => !isNaN(c.coordinates[0]) && !isNaN(c.coordinates[1]),
    )
  }, [data?.clusters])

  if (isPending) return <MapSkeleton />
  if (error)
    return (
      <div className="flex h-[70vh] items-center justify-center text-red-500">
        Error.
      </div>
    )

  return (
    <>
      <div className="relative mt-6 h-[70vh] w-full overflow-hidden rounded-lg">
        <MapContainer
          center={INITIAL_VIEW_STATE.center}
          zoom={INITIAL_VIEW_STATE.zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://tile.gbif.org/3857/omt/{z}/{x}/{y}@2x.png?style=gbif-geyser-en"
            attribution='© <a href="https://www.gbif.org/citation-guidelines">GBIF</a>'
          />
          <MapEventHandler />
          <MapControls />
          {layerData.length > 0 && zoom <= 12 && (
            <CanvasMarkers
              clusters={layerData}
              palette={palettes[activePalette]}
            />
          )}
          {layerData.length > 0 && (
            <SimpleMarkers
              clusters={layerData}
              onMarkerClick={setSelectedPoint}
              palette={palettes[activePalette]}
              // Pass the palette name string down to be used in the key
              paletteName={activePalette}
            />
          )}
        </MapContainer>

        {selectedPoint && (
          <SpecimenPointDialog
            point={selectedPoint}
            isOpen={!!selectedPoint}
            onClose={() => setSelectedPoint(null)}
          />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-4">
        <Select
          value={activePalette}
          onValueChange={(value: PaletteName) => setActivePalette(value)}
        >
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
      <div className="relative mt-6 h-[70vh] w-full overflow-hidden rounded-lg border border-gray-200">
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
