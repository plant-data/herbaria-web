import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import { FeatureGroup, MapContainer, TileLayer } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import { cn } from '@/lib/utils'

interface Coordinate {
  lat: number
  lng: number
}

interface DrawEvent {
  layer: L.Layer
  layerType: string
}

interface EditEvent {
  layers: L.LayerGroup
}

interface DeleteEvent {
  layers: L.LayerGroup
}

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
  const mapRef = useRef<L.Map>(null)
  const featureGroupRef = useRef<L.FeatureGroup>(null)
  const currentPolygonRef = useRef<L.Polygon | null>(null)

  // Function to update polygon based on geometry
  const updatePolygon = (featureGroup: L.FeatureGroup | null) => {
    if (!featureGroup) return

    if (currentPolygonRef.current) {
      featureGroup.removeLayer(currentPolygonRef.current)
      currentPolygonRef.current = null
    }

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

  // Callback ref to handle FeatureGroup initialization
  const setFeatureGroupRef = (featureGroup: L.FeatureGroup | null) => {
    featureGroupRef.current = featureGroup
    if (featureGroup) {
      updatePolygon(featureGroup)
    }
  }

  // Effect to sync geometry prop with map display
  useEffect(() => {
    if (featureGroupRef.current) {
      updatePolygon(featureGroupRef.current)
    }
  }, [geometry])

  const handleCreated = (e: DrawEvent): void => {
    const { layer, layerType } = e

    if (layerType === 'polygon') {
      if (featureGroupRef.current && currentPolygonRef.current) {
        featureGroupRef.current.removeLayer(currentPolygonRef.current)
      }

      const polygonLayer = layer as L.Polygon
      const coordinates: Array<[number, number]> = polygonLayer
        .getLatLngs()[0]
        .map((coord: Coordinate) => [coord.lat, coord.lng])

      currentPolygonRef.current = polygonLayer
      setGeometry(coordinates)
    }
  }

  const handleEdited = (e: EditEvent): void => {
    const layers = e.layers
    layers.eachLayer((layer: L.Layer) => {
      if (layer === currentPolygonRef.current) {
        const polygonLayer = layer as L.Polygon
        const coordinates: Array<[number, number]> = polygonLayer
          .getLatLngs()[0]
          .map((coord: Coordinate) => [coord.lat, coord.lng])
        setGeometry(coordinates)
      }
    })
  }

  const handleDeleted = (e: DeleteEvent): void => {
    setGeometry([])
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm">{label}</div>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        className={cn('border-input w-full overflow-hidden rounded-sm border shadow-xs', 'h-[300px]', mapHeight)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <FeatureGroup ref={setFeatureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: 'red',
                  message: t('search.filters.geometry-wrong'),
                },
                shapeOptions: {
                  color: '#3388ff',
                  weight: 3,
                  opacity: 0.8,
                  fillOpacity: 0.2,
                },
              },
            }}
            edit={{
              featureGroup: featureGroupRef.current,
            }}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  )
}
