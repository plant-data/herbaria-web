import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Earth, House, Settings } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { Link, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { PaletteName } from '@/features/search/constants/map-palettes'
import type { SpecimenData } from '@/features/search/types/types'
import { paletteColors, palettes } from '@/features/search/constants/map-palettes'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { useSpecimensCluster, useSpecimensMap, useSpecimensPoint } from '@/features/search/api/get-occurrences'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MAP_CENTER, ZOOM } from '@/features/search/constants/constants'
import { LoadingBadge } from '@/features/search/components/loading-badge'
import {
  Map,
  MapDrawControl,
  MapDrawDelete,
  MapDrawEdit,
  MapDrawPolygon,
  MapLayers,
  MapLayersControl,
  MapTileLayer,
  MapZoomControl,
} from '@/components/ui/map'

type ClusterData = {
  coordinates: [number, number]
  count: number
  gridCode?: string
  clusterCode?: string
}

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
  const { t } = useTranslation()
  const map = useMap()
  const handleResetView = () => map.setView(INITIAL_VIEW_STATE.center, INITIAL_VIEW_STATE.zoom)
  const handleWorldView = () => map.setView([20, 5], 2)
  return (
    <ButtonGroup
      orientation="vertical"
      aria-label="Map navigation controls"
      className="absolute top-20 left-1 z-1000 h-fit"
    >
      <Button
        type="button"
        size="icon"
        variant="secondary"
        onClick={handleResetView}
        className="hover:bg-secondary dark:hover:bg-secondary border bg-white dark:bg-white"
        title={t('search.map.reset-view')}
        aria-label={t('search.map.reset-view')}
      >
        <House />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        onClick={handleWorldView}
        className="hover:bg-secondary dark:hover:bg-secondary border bg-white dark:bg-white"
        title={t('search.map.world-view')}
        aria-label={t('search.map.world-view')}
      >
        <Earth />
      </Button>
    </ButtonGroup>
  )
}

const MapDrawControls = memo(function MapDrawControls({
  geometry,
  setGeometry,
}: {
  geometry: Array<[number, number]>
  setGeometry: (geometry: Array<[number, number]>) => void
}) {
  const { t } = useTranslation()
  const featureGroupRef = useRef<L.FeatureGroup | null>(null)
  const currentPolygonRef = useRef<L.Polygon | null>(null)

  // Function to update polygon based on geometry
  const updatePolygon = (featureGroup: L.FeatureGroup | null) => {
    if (!featureGroup) return

    // Clear existing layers to ensure sync
    featureGroup.clearLayers()
    currentPolygonRef.current = null

    if (geometry.length > 0) {
      const leafletCoords = geometry.map(([lat, lng]) => [lat, lng] as [number, number])

      const polygon = L.polygon(leafletCoords, {
        color: 'var(--primary)',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0,
        interactive: false,
      })

      featureGroup.addLayer(polygon)
      currentPolygonRef.current = polygon
    }
  }

  // Effect to sync geometry prop with map display
  useEffect(() => {
    if (featureGroupRef.current) {
      updatePolygon(featureGroupRef.current)
    }
  }, [geometry])

  const handleLayersChange = (featureGroup: L.FeatureGroup) => {
    const layers = featureGroup.getLayers()

    // If no layers, clear geometry
    if (layers.length === 0) {
      setGeometry([])
      currentPolygonRef.current = null
      return
    }

    // If multiple layers, keep the last one (newly created)
    if (layers.length > 1) {
      const newLayer = layers[layers.length - 1] as L.Polygon

      // Remove others
      layers.forEach((layer) => {
        if (layer !== newLayer) {
          featureGroup.removeLayer(layer)
        }
      })

      const latLngs = newLayer.getLatLngs()[0] as Array<L.LatLng>
      const coordinates = latLngs.map((coord) => [coord.lat, coord.lng] as [number, number])
      currentPolygonRef.current = newLayer
      setGeometry(coordinates)
    } else {
      // Single layer (edited or just created)
      const layer = layers[0] as L.Polygon
      const latLngs = layer.getLatLngs()[0] as Array<L.LatLng>
      const coordinates = latLngs.map((coord) => [coord.lat, coord.lng] as [number, number])
      currentPolygonRef.current = layer
      setGeometry(coordinates)
    }
  }

  return (
    <MapDrawControl
      className="bottom-1 left-1"
      onFeatureGroupReady={(fg) => {
        featureGroupRef.current = fg
        updatePolygon(fg)
      }}
      onLayersChange={handleLayersChange}
    >
      <MapDrawPolygon
        shapeOptions={{
          color: 'var(--primary)',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.2,
        }}
        drawError={{
          color: 'red',
          message: t('search.filters.geometry-wrong'),
        }}
        allowIntersection={false}
      />
      <MapDrawEdit />
      <MapDrawDelete />
    </MapDrawControl>
  )
})

function ColorLegend({ min, max, colors }: { min: number; max: number; colors: Array<string> }) {
  const step = (max - min) / 5
  const ranges = [
    { label: `> ${Math.round(max)}`, color: colors[5] },
    { label: `${Math.round(min + step * 4) + 1}-${Math.round(max)}`, color: colors[4] },
    { label: `${Math.round(min + step * 3) + 1}-${Math.round(min + step * 4)}`, color: colors[3] },
    { label: `${Math.round(min + step * 2) + 1}-${Math.round(min + step * 3)}`, color: colors[2] },
    { label: `${Math.round(min + step) + 1}-${Math.round(min + step * 2)}`, color: colors[1] },
    { label: `${min}-${Math.round(min + step)}`, color: colors[0] },
  ]
  return (
    <Card className="flex-1 rounded-md p-1.5 shadow-xs md:p-2.5 @xl/map-settings:flex-none @xl/map-settings:p-2">
      <CardContent className="p-0">
        <div className="grid grid-cols-3 gap-x-2 gap-y-1 md:gap-4 @xl/map-settings:flex @xl/map-settings:flex-wrap @xl/map-settings:gap-3">
          {ranges.map((range, index) => (
            <div
              key={index}
              className="flex items-center gap-1 text-[10px] @xl/map-settings:gap-1.5 @xl/map-settings:text-xs"
            >
              <div
                className="h-3 w-3 shrink-0 rounded-sm border border-gray-300 md:h-4 md:w-4 @xl/map-settings:h-3.5 @xl/map-settings:w-3.5"
                style={{ backgroundColor: range.color }}
              />
              <span className="whitespace-nowrap text-gray-700 dark:text-gray-300">{range.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PointPopupContent({ coordinates, count }: { coordinates: [number, number]; count: number }) {
  const { t } = useTranslation()
  const [skip, setSkip] = useState(0)
  const { herbariaId } = useParams({ strict: false })

  const { data, isPending, error } = useSpecimensPoint({
    customFilters: {
      decimalLatitude: coordinates[1],
      decimalLongitude: coordinates[0],
    },
    customSkip: skip,
  })

  if (isPending) return <div>{t('search.map.loading-details')}</div>
  if (error) return <div className="text-red-500">{t('search.map.error-details')}</div>
  if (!data?.occurrences?.length) return <div>{t('search.map.no-details')}</div>

  return (
    <div className="min-w-[300px] text-sm">
      <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-2">
        {data.occurrences.map((occ: SpecimenData) => (
          <li key={occ.occurrenceID}>
            <span>{occ.scientificName || t('search.map.unknown-species')}</span>{' '}
            <Link
              className="text-blue-400"
              to="/$herbariaId/specimens/$occurrenceID"
              params={{ herbariaId, occurrenceID: occ.occurrenceID }}
            >
              ({occ.occurrenceID})
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <Button onClick={() => setSkip((prev) => Math.max(0, prev - 10))} disabled={skip === 0}>
          {t('search.map.previous')}
        </Button>
        <span className="text-xs text-gray-500">
          {t('search.map.showing', { start: skip + 1, end: Math.min(skip + 10, count), total: count })}
        </span>
        <Button onClick={() => setSkip((prev) => prev + 10)} disabled={skip + 10 >= count}>
          {t('search.map.next')}
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
  const { t } = useTranslation()
  const [skip, setSkip] = useState(0)
  const { herbariaId } = useParams({ strict: false })

  const { data, isPending, error } = useSpecimensCluster({
    customFilters: {
      gridCode,
      clusterCode,
    },
    customSkip: skip,
  })

  if (isPending) return <div>{t('search.map.loading-details')}</div>
  if (error) return <div className="text-red-500">{t('search.map.error-details')}</div>
  if (!data?.occurrences?.length) return <div>{t('search.map.no-details')}</div>

  return (
    <div className="min-w-[300px] text-sm">
      <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-2">
        {data.occurrences.map((occ: SpecimenData) => (
          <li key={occ.occurrenceID}>
            <span>{occ.scientificName || t('search.map.unknown-species')}</span>{' '}
            <Link
              className="text-blue-400"
              to="/$herbariaId/specimens/$occurrenceID"
              params={{ herbariaId, occurrenceID: occ.occurrenceID }}
            >
              ({occ.occurrenceID})
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <Button onClick={() => setSkip((prev) => Math.max(0, prev - 10))} disabled={skip === 0}>
          {t('search.map.previous')}
        </Button>
        <span className="text-xs text-gray-500">
          {t('search.map.showing', { start: skip + 1, end: Math.min(skip + 10, count), total: count })}
        </span>
        <Button onClick={() => setSkip((prev) => prev + 10)} disabled={skip + 10 >= count}>
          {t('search.map.next')}
        </Button>
      </div>
    </div>
  )
}

const getDynamicColor = (count: number, thresholds: Array<number>, colors: Array<string>) => {
  if (count > thresholds[4]) return colors[5]
  if (count > thresholds[3]) return colors[4]
  if (count > thresholds[2]) return colors[3]
  if (count > thresholds[1]) return colors[2]
  if (count > thresholds[0]) return colors[1]
  return colors[0]
}

// Simplified markers component that works at all zoom levels
const LeafletMarkers = memo(function LeafletMarkers({
  clusters,
  onMarkerClick,
  colors,
  min,
  max,
}: {
  clusters: Array<ClusterData>
  onMarkerClick: (cluster: ClusterData) => void
  colors: Array<string>
  min: number
  max: number
}) {
  const zoom = useFilterStore((state) => state.zoom)

  const step = (max - min) / 5
  const thresholds = [min + step, min + step * 2, min + step * 3, min + step * 4, max]

  // Calculate marker radius based on zoom level and count
  const getMarkerRadius = (currentZoom: number) => {
    switch (currentZoom) {
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

        const markerColor = getDynamicColor(cluster.count, thresholds, colors)
        // isPoint is in testing remove this part if doesn't work
        const isPoint = cluster.gridCode === undefined && cluster.clusterCode === undefined

        if (isPoint) {
          const icon = L.divIcon({
            className: '!bg-transparent !border-0',
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="${markerColor}" fill-opacity="0.6" stroke="${markerColor}" stroke-opacity="0.8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30],
          })
          return (
            <Marker
              key={`${lat}-${lng}-${index}-${colors[0]}-${min}-${max}`}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  onMarkerClick(cluster)
                },
              }}
            />
          )
        }

        const radius = getMarkerRadius(zoom)

        return (
          <CircleMarker
            key={`${lat}-${lng}-${index}-${colors[0]}-${min}-${max}`}
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
})

function SpecimenPointDialog({
  cluster,
  isOpen,
  onClose,
}: {
  cluster: ClusterData
  isOpen: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const isPoint = cluster.gridCode === undefined && cluster.clusterCode === undefined
  const title = isPoint
    ? `${t('search.map.specimens')} (${cluster.count})`
    : `${t('search.map.cluster-specimens')} (${cluster.count})`

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

function MapSettingsDialog({
  currentPalette,
  currentMax,
  onApply,
}: {
  currentPalette: PaletteName
  currentMax: number
  onApply: (palette: PaletteName, max: number) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [palette, setPalette] = useState<PaletteName>(currentPalette)
  const [max, setMax] = useState(currentMax)

  useEffect(() => {
    if (open) {
      setPalette(currentPalette)
      setMax(currentMax)
    }
  }, [open, currentPalette, currentMax])

  const handleConfirm = () => {
    onApply(palette, max)
    setOpen(false)
  }

  const handleReset = () => {
    onApply('Classic', 100)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0" title={t('search.map.settings.title')}>
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('search.map.settings.title')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="palette">{t('search.map.settings.palette')}</Label>
            <Select value={palette} onValueChange={(value: PaletteName) => setPalette(value)}>
              <SelectTrigger id="palette">
                <SelectValue placeholder={t('search.map.settings.select-palette')} />
              </SelectTrigger>
              <SelectContent className="z-99999999">
                {Object.keys(palettes).map((paletteName) => (
                  <SelectItem key={paletteName} value={paletteName}>
                    {paletteName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="max-scale">{t('search.map.settings.max-scale')}</Label>
            <Input id="max-scale" type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            {t('search.map.settings.reset')}
          </Button>
          <Button onClick={handleConfirm}>{t('search.map.settings.confirm')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main component with simplified rendering
export function SpecimensMap() {
  const { t } = useTranslation()
  const { zoom, mapCenter, geometry, setGeometry } = useFilterStore(
    useShallow((state) => ({
      zoom: state.zoom,
      mapCenter: state.mapCenter,
      geometry: state.geometry,
      setGeometry: state.setGeometry,
    })),
  )
  const { data, isPending, isFetching, error } = useSpecimensMap()
  const [activePalette, setActivePalette] = useState<PaletteName>('Classic')
  const [maxScale, setMaxScale] = useState(100)

  const [selectedCluster, setSelectedCluster] = useState<ClusterData | null>(null)

  const layerData = useMemo(() => {
    if (!data?.clusters) return []
    return data.clusters.filter((c: ClusterData) => !isNaN(c.coordinates[0]) && !isNaN(c.coordinates[1]))
  }, [data?.clusters])

  const isFetchingNewData = isFetching || isPending

  // if (isPending) return <MapSkeleton />
  if (error)
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500 md:h-[70vh]">{t('search.map.error')}</div>
    )

  return (
    <>
      <div className="relative mx-auto mt-6 h-[50vh] max-h-[480px] w-full max-w-[1200px] overflow-hidden rounded-lg md:h-[70vh]">
        {isFetchingNewData && <LoadingBadge className="absolute top-3 left-1/2 z-100 -translate-x-1/2" />}
        <Map center={mapCenter} zoom={zoom} preferCanvas={true} minZoom={2}>
          <MapLayers defaultTileLayer="GBIF Geyser">
            <MapTileLayer
              name="GBIF Geyser"
              url="https://tile.gbif.org/3857/omt/{z}/{x}/{y}@2x.png?style=gbif-geyser-en"
              attribution='© <a href="https://www.gbif.org/citation-guidelines">GBIF</a>'
            />
            <MapTileLayer
              name="OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapLayersControl />
          </MapLayers>
          <MapZoomControl />
          <MapEventHandler />
          <MapControls />
          <MapDrawControls geometry={geometry} setGeometry={setGeometry} />
          {layerData.length > 0 && (
            <LeafletMarkers
              clusters={layerData}
              onMarkerClick={setSelectedCluster}
              colors={paletteColors[activePalette]}
              min={0}
              max={maxScale}
            />
          )}
        </Map>

        {selectedCluster && (
          <SpecimenPointDialog
            cluster={selectedCluster}
            isOpen={!!selectedCluster}
            onClose={() => setSelectedCluster(null)}
          />
        )}
      </div>
      <div className="@container/map-settings w-full">
        <div className="mt-2 flex items-start gap-2 @xl/map-settings:items-center @xl/map-settings:gap-3">
          <MapSettingsDialog
            currentPalette={activePalette}
            currentMax={maxScale}
            onApply={(p, m) => {
              setActivePalette(p)
              setMaxScale(m)
            }}
          />
          <ColorLegend min={0} max={maxScale} colors={paletteColors[activePalette]} />
        </div>
      </div>
    </>
  )
}

/* function MapSkeleton() {
  return (
    <>
      <div className="relative mt-6 h-[50vh] w-full overflow-hidden rounded-lg border border-gray-200 @sm/mainresult:h-[70vh]">

        <div className="h-full w-full">
          <Skeleton className="h-full w-full" />


          <div className="absolute top-20 left-3 z-10 flex flex-col gap-2">
            <Skeleton className="size-[30px] rounded-[3px]" />
            <Skeleton className="size-[30px] rounded-[3px]" />
          </div>


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


      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>

    
        <Card className="rounded-sm p-2 shadow-xs md:p-2.5">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3 md:gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Skeleton className="h-3.5 w-3.5 rounded-sm md:h-4 md:w-4" />
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
 */
