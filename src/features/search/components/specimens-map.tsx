import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { useSpecimensMap } from '@/features/search/api/get-occurrences'
import 'leaflet/dist/leaflet.css'

// Import our palettes and types
import {
  palettes,
  type PaletteName,
} from '@/features/search/constants/map-palettes'

// Import shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Earth, House } from 'lucide-react'

type ClusterData = { coordinates: [number, number]; count: number }
const INITIAL_VIEW_STATE = {
  center: [41.902782, 12.496366] as [number, number],
  zoom: 5,
}

type PaletteFn = (count: number) => string

class CanvasMarkerLayer extends L.Layer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private clusters: ClusterData[] = []
  private getCircleColor: PaletteFn // The active palette function

  constructor(options?: L.LayerOptions & { initialPalette: PaletteFn }) {
    super(options)
    this.canvas = document.createElement('canvas')
    this.canvas.style.imageRendering = 'pixelated'
    this.ctx = this.canvas.getContext('2d')!
    this.getCircleColor = options?.initialPalette || palettes.Classic
  }

  // Public method to dynamically update the palette
  public updatePalette(newPalette: PaletteFn): void {
    this.getCircleColor = newPalette
    this.redraw() // Redraw with new colors
  }

  // Other methods (onAdd, onRemove, updateData, redraw) are mostly the same,
  // but with click logic removed and using this.getCircleColor

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

  updateData(clusters: ClusterData[]): void {
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

      this.ctx.fillStyle = this.getCircleColor(cluster.count) // Use the instance's palette
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
  clusters: ClusterData[]
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

  // Effect to update the layer's palette when the prop changes
  useEffect(() => {
    layerRef.current.updatePalette(palette)
  }, [palette])

  return null
}

function MapEventHandler() {
  const { setZoom, setBbox } = useFilterStore()
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

  const handleResetView = () => {
    map.setView(INITIAL_VIEW_STATE.center, INITIAL_VIEW_STATE.zoom)
  }

  const handleWorldView = () => {
    map.setView([20, 5], 2)
  }

  return (
    <div className="absolute top-20 left-3 z-[1000] flex flex-col gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={handleResetView}
        className="bg-white text-xs size-[30px] rounded-[3px] ring-2 ring-gray-400"
        title="Reset to initial view"
      >
        <House className="size-4" />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleWorldView}
        className="bg-white text-xs size-[30px] rounded-[3px] ring-2 ring-gray-400"
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
    <Card className="p-2.5 rounded-sm shadow-xs">
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-4">
          {ranges.map((range, index) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <div
                className="w-4 h-4 rounded-sm border border-gray-300"
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

export function SpecimensMap() {
  const { data, isPending, error } = useSpecimensMap()
  const [activePalette, setActivePalette] = useState<PaletteName>('Classic')

  const layerData = useMemo(() => {
    if (!data?.clusters) return []
    return data.clusters.filter(
      (c: ClusterData) => !isNaN(c.coordinates[0]) && !isNaN(c.coordinates[1]),
    )
  }, [data?.clusters])

  if (isPending)
    return (
      <div className="h-[70vh] flex items-center justify-center">
        Loading...
      </div>
    )
  if (error)
    return (
      <div className="h-[70vh] flex items-center justify-center text-red-500">
        Error.
      </div>
    )

  return (
    <>
      <div className="mt-6 relative h-[70vh] w-full rounded-lg overflow-hidden">
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
          {layerData.length > 0 && (
            <CanvasMarkers
              clusters={layerData}
              palette={palettes[activePalette]}
            />
          )}
        </MapContainer>
      </div>

      <div className="mt-2 flex items-center justify-between">
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
