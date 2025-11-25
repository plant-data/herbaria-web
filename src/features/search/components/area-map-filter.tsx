import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import { cn } from '@/lib/utils'
import {
  Map,
  MapDrawControl,
  MapDrawDelete,
  MapDrawEdit,
  MapDrawPolygon,
  MapTileLayer,
  MapZoomControl,
} from '@/components/ui/map'

interface AreaMapFilterProps {
  label: string
  mapHeight: string
  center: [number, number]
  zoom: number
  geometry: Array<[number, number]>
  setGeometry: (geometry: Array<[number, number]>) => void
}

export function AreaMapFilter({ label, mapHeight, center, zoom, geometry, setGeometry }: AreaMapFilterProps) {
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
        color: '#3388ff',
        weight: 3,
        opacity: 0.8,
        fillOpacity: 0.2,
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
    <div className="flex flex-col gap-1">
      <div className="text-sm">{label}</div>
      <Map
        center={center}
        zoom={zoom}
        className={cn('border-input w-full overflow-hidden rounded-sm border shadow-xs', 'h-[300px]', mapHeight)}
      >
        <MapTileLayer />
        <MapZoomControl />
        <MapDrawControl
          onFeatureGroupReady={(fg) => {
            featureGroupRef.current = fg
            updatePolygon(fg)
          }}
          onLayersChange={handleLayersChange}
        >
          <MapDrawPolygon
            shapeOptions={{
              color: '#3388ff',
              weight: 3,
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
      </Map>
    </div>
  )
}
