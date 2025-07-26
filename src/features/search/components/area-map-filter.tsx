import { useRef, useState } from 'react'
import { FeatureGroup, MapContainer, TileLayer } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
// Fix for default markers in react-leaflet

interface Coordinate {
  lat: number
  lng: number
}

interface PolygonData {
  id: number
  coordinates: Array<[number, number]>
  layer: L.Layer
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

export function AreaMapFilter() {
  const [polygon, setPolygon] = useState<PolygonData | null>(null)
  const mapRef = useRef<L.Map>(null)
  const featureGroupRef = useRef<L.FeatureGroup>(null)

  const handleCreated = (e: DrawEvent): void => {
    const { layer, layerType } = e

    if (layerType === 'polygon') {
      // Clear existing polygon before creating new one
      if (featureGroupRef.current && polygon) {
        featureGroupRef.current.removeLayer(polygon.layer)
      }

      const polygonLayer = layer as L.Polygon
      const coordinates: Array<[number, number]> = polygonLayer
        .getLatLngs()[0]
        .map((coord: Coordinate) => [coord.lat, coord.lng])
      const newPolygon: PolygonData = {
        id: Date.now(),
        coordinates: coordinates,
        layer: layer,
      }

      setPolygon(newPolygon)
    }
  }

  const handleEdited = (e: EditEvent): void => {
    const layers = e.layers
    layers.eachLayer((layer: L.Layer) => {
      const polygonLayer = layer as L.Polygon
      const coordinates: Array<[number, number]> = polygonLayer
        .getLatLngs()[0]
        .map((coord: Coordinate) => [coord.lat, coord.lng])
      if (polygon && polygon.layer === layer) {
        setPolygon({ ...polygon, coordinates: coordinates })
      }
    })
  }

  const handleDeleted = (e: DeleteEvent): void => {
    const layers = e.layers
    layers.eachLayer((layer: L.Layer) => {
      if (polygon && polygon.layer === layer) {
        setPolygon(null)
      }
    })
  }

  return (
    <div className="relative flex-1">
      <MapContainer
        ref={mapRef}
        center={[45.6495, 13.7768]} // Trieste coordinates
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <FeatureGroup ref={featureGroupRef}>
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
                  color: '#e1e100',
                  message: '<strong>Error:</strong> shape edges cannot cross!',
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
