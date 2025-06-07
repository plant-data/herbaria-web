import { useMemo, useState, useEffect } from 'react'

import { DeckGL } from '@deck.gl/react'
import { HexagonLayer } from '@deck.gl/aggregation-layers'
import { Map  } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import type {PickingInfo} from 'react-map-gl/maplibre'; // Using react-map-gl's Map component for MapLibre
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import 'maplibre-gl/dist/maplibre-gl.css' // Essential MapLibre CSS

import { useSpecimensMap } from '@/features/search/api/get-occurrences'


// Type for individual occurrence data
type Occurrence = {
  occurrenceID: string
  catalogNumber: string
  otherCatalogNumbers: string | null
  basisOfRecord: string | null
  verbatimIdentification: string | null
  scientificName: string
  verbatimEventDate: string
  eventDate: string
  year: number
  month: number
  locality: string
  verbatimElevation: string | null
  minimumElevationInMeters: number | null
  maximumElevationInMeters: number | null
  country: string
  recordedBy: string | null
  identifiedBy: string | null
  floritalyName: string
  wfoName: string | null
  gbifName: string
  processedLocality: string | null
  decimalLatitude: number
  decimalLongitude: number
  geodeticDatum: string
  coordinatesUncertaintyInMeters: number
  georeferenceProtocol: string | null
} & Record<string, unknown> // Allows for additional unknown properties

// Initial map view state (e.g., centered on Italy given 'floritalyName')
const INITIAL_VIEW_STATE = {
  longitude: 12.496366, // Rome
  latitude: 41.902782, // Rome
  zoom: 4.5,
}

// Publicly available MapLibre style
const GBIF_MAP_STYLE = {
  version: 8,
  sources: {
    'gbif-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.gbif.org/3857/omt/{z}/{x}/{y}@2x.png?style=gbif-geyser-en',
      ],
      tileSize: 512, // For @2x tiles, tileSize is typically 512
      attribution:
        '<a href="https://www.gbif.org/citation-guidelines" target="_blank">© GBIF</a>',
    },
  },
  layers: [
    {
      id: 'gbif-raster-layer',
      type: 'raster',
      source: 'gbif-tiles',
      minzoom: 0,
      maxzoom: 22, // Adjust maxzoom as appropriate for the tile source
    },
  ],
} as const // Use 'as const' for better type inference if desired

export function SpecimensMap() {


  const { zoom: currentZoom, bbox, setZoom: setCurrentZoom, setBbox } = useFilterStore()

  const [debouncedZoom, setDebouncedZoom] = useState<number>(
    INITIAL_VIEW_STATE.zoom,
  )
  const [isZooming, setIsZooming] = useState<boolean>(false)

  const { data, isPending, error } = useSpecimensMap()

  // Debounce zoom changes to improve performance
  useEffect(() => {
    setIsZooming(true)
    const timer = setTimeout(() => {
      setDebouncedZoom(currentZoom)
      setIsZooming(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [currentZoom])

  // Memoize and filter data for the HexagonLayer, ensuring valid coordinates
  const layerData = useMemo(() => {
    if (!data?.occurrences) return []

    const filtered = data.occurrences.filter((occ: Occurrence) => {
      // Convert to numbers to handle any string values
      const lat = Number(occ.decimalLatitude)
      const lng = Number(occ.decimalLongitude)

      // Validate coordinates - check if they're valid numbers and in reasonable range
      return (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat !== 0 && // Filter out 0,0 coordinates which are often default placeholders
        lng !== 0 &&
        lat >= -90 &&
        lat <= 90 && // Valid latitude range
        lng >= -180 &&
        lng <= 180
      ) // Valid longitude range
    })

    console.log(
      `Filtered ${filtered.length} valid points from ${data.occurrences.length} total`,
    )
    return filtered
  }, [data])

  // Calculate hexagon radius based on debounced zoom level
  const getHexagonRadius = useMemo(() => {
    if (debouncedZoom < 4) {
      return 50000 // Larger radius for zoomed out view
    } else if (debouncedZoom >= 4 && debouncedZoom <= 6) {
      return 10000 // Medium radius for mid-range zoom
    } else {
      return 5000 // Smaller radius for zoomed in view
    }
  }, [debouncedZoom])

  // Only create layers when zoom is stable or on initial render
  const layers = useMemo(() => {
    if (isZooming && layerData.length > 500) {
      // During zooming with large datasets, return a simplified layer or previous layer
      // This prevents expensive recalculations during zoom operations
      return []
    }

    return [
      new HexagonLayer<Occurrence>({
        id: 'hexagon-layer',
        data: layerData,
        getPosition: (d: Occurrence) => {
          const lng = Number(d.decimalLongitude)
          const lat = Number(d.decimalLatitude)
          return [lng, lat]
        },
        radius: getHexagonRadius,
        updateTriggers: {
          radius: getHexagonRadius,
        },
        elevationScale: 100,
        extruded: false,
        pickable: true,
        autoHighlight: true,
        coverage: 0.85,
        upperPercentile: 100,
        material: {
          ambient: 0.64,
          diffuse: 0.6,
          shininess: 32,
          specularColor: [51, 51, 51],
        },
        colorRange: [
          [1, 152, 189],
          [73, 227, 206],
          [216, 254, 181],
          [254, 237, 177],
          [254, 173, 84],
          [209, 55, 78],
        ],
      }),
    ]
  }, [layerData, getHexagonRadius, isZooming])

  const getTooltip = (info: PickingInfo) => {
    if (!info.object) {
      return null
    }
    // object for HexagonLayer refers to the hexagon cell itself
    const { position, points } = info.object
    const count = points?.length || 0

    return {
      html: `
        <div style="background-color: white; padding: 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <strong>Hexagon Details</strong><br/>
          Centroid Longitude: ${position[0].toFixed(4)}<br/>
          Centroid Latitude: ${position[1].toFixed(4)}<br/>
          Occurrence Count: ${count}
        </div>
      `,
    }
  }

  // Handle view state changes with throttling
  const handleViewStateChange = ({ viewState }: { viewState: any }) => {
    // Only update if zoom changed by a meaningful amount
    if (Math.abs(viewState.zoom - currentZoom) > 0.1) {
      setCurrentZoom(viewState.zoom)
    }
  }

  if (isPending) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center text-lg">
        Loading occurrences for map...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center text-red-600">
        Error loading data: {error.message || 'Unknown error'}
      </div>
    )
  }

  if (!layerData?.length && !isPending) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center text-muted-foreground">
        No occurrences found for the current filters.
      </div>
    )
  }

  return (
    <div className="relative h-[70vh] w-full">
      {isZooming && layerData.length > 200 && (
        <div className="absolute top-2 left-2 bg-white/80 px-3 py-1 rounded-md z-10 text-sm">
          Zooming, please wait...
        </div>
      )}
      <DeckGL
        layers={layers}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip={getTooltip}
        onViewStateChange={handleViewStateChange}
      >
        <Map mapLib={maplibregl} mapStyle={GBIF_MAP_STYLE} />
      </DeckGL>
    </div>
  )
}
