import { useEffect, useMemo, useRef, useState } from 'react'

import { DeckGL } from '@deck.gl/react'
import { ColumnLayer } from '@deck.gl/layers'
import { Map } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import 'maplibre-gl/dist/maplibre-gl.css' // Essential MapLibre CSS

import { useSpecimensMap } from '@/features/search/api/get-occurrences'

// Type for cluster data from the map API
type ClusterData = {
  coordinates: Array<number>
  count: number
}

// Initial map view state (e.g., centered on Italy given 'floritalyName')
const INITIAL_VIEW_STATE = {
  longitude: 12.496366, // Rome
  latitude: 41.902782, // Rome
  zoom: 4.5,
}

// Publicly available MapLibre style
const GBIF_MAP_STYLE = {
  version: 8 as const,
  sources: {
    'gbif-tiles': {
      type: 'raster' as const,
      tiles: [
        'https://tile.gbif.org/3857/omt/{z}/{x}/{y}@2x.png?style=gbif-geyser-en',
      ] as Array<string>,
      tileSize: 512, // For @2x tiles, tileSize is typically 512
      attribution:
        '<a href="https://www.gbif.org/citation-guidelines" target="_blank">© GBIF</a>',
    },
  },
  layers: [
    {
      id: 'gbif-raster-layer',
      type: 'raster' as const,
      source: 'gbif-tiles',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
}

export function SpecimensMap() {
  const {
    zoom: currentZoom,
    setZoom: setCurrentZoom,
    setBbox,
  } = useFilterStore()

  const [debouncedZoom, setDebouncedZoom] = useState<number>(
    INITIAL_VIEW_STATE.zoom,
  )
  const [isZooming, setIsZooming] = useState<boolean>(false)

  const { data, isPending, error } = useSpecimensMap()

  const mapRef = useRef<MapRef>()

  // Initialize bbox on component mount
  useEffect(() => {
    // Set initial bounding box based on initial view state with more accurate calculation
    const { longitude, latitude, zoom } = INITIAL_VIEW_STATE

    // More accurate bounding box calculation using Web Mercator projection
    // Approximate visible area based on zoom level and standard map dimensions
    const earthCircumference = 40075016.686 // meters
    const metersPerPixel =
      (earthCircumference * Math.cos((latitude * Math.PI) / 180)) /
      Math.pow(2, zoom + 8)

    // Assume a standard map viewport size (roughly 800x600 pixels)
    const viewportWidth = 800
    const viewportHeight = 600

    const latOffset = (metersPerPixel * viewportHeight) / 2 / 111319.5 // Convert meters to degrees lat
    const lngOffset =
      (metersPerPixel * viewportWidth) /
      2 /
      (111319.5 * Math.cos((latitude * Math.PI) / 180)) // Convert meters to degrees lng

    const initialBbox: [number, number, number, number] = [
      Math.max(-180, longitude - lngOffset), // west
      Math.max(-90, latitude - latOffset), // south
      Math.min(180, longitude + lngOffset), // east
      Math.min(90, latitude + latOffset), // north
    ]

    setBbox(initialBbox)
    setCurrentZoom(zoom)
  }, [setBbox, setCurrentZoom])

  // Debounce zoom changes to improve performance
  useEffect(() => {
    setIsZooming(true)
    const timer = setTimeout(() => {
      setDebouncedZoom(currentZoom)
      setIsZooming(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [currentZoom])

  // Memoize and filter data for the ColumnLayer, ensuring valid coordinates
  const layerData = useMemo(() => {
    if (!data?.clusters) return []

    const filtered = data.clusters.filter((cluster: ClusterData) => {
      // coordinates is [longitude, latitude]
      const [lng, lat] = cluster.coordinates

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
    return filtered
  }, [data])

  // Color interpolation function based on occurrence count with fixed range 0-100+
  const getColorFromCount = (
    count: number,
  ): [number, number, number, number] => {
    // Fixed range from 0 to 100+ (clamped at 100 for color calculation)
    const clampedCount = Math.min(count, 100)
    const normalizedValue = clampedCount / 100

    // GBIF-inspired violet to yellow color palette
    if (normalizedValue < 0.2) {
      // Dark violet to violet
      const t = normalizedValue / 0.2
      return [
        Math.round(68 + (102 - 68) * t), // R: 68 -> 102
        Math.round(1 + (37 - 1) * t), // G: 1 -> 37
        Math.round(84 + (144 - 84) * t), // B: 84 -> 144
        240, // Less transparent
      ]
    } else if (normalizedValue < 0.4) {
      // Violet to blue
      const t = (normalizedValue - 0.2) / 0.2
      return [
        Math.round(102 + (32 - 102) * t), // R: 102 -> 32
        Math.round(37 + (107 - 37) * t), // G: 37 -> 107
        Math.round(144 + (196 - 144) * t), // B: 144 -> 196
        240,
      ]
    } else if (normalizedValue < 0.6) {
      // Blue to cyan
      const t = (normalizedValue - 0.4) / 0.2
      return [
        Math.round(32 + (35 - 32) * t), // R: 32 -> 35
        Math.round(107 + (161 - 107) * t), // G: 107 -> 161
        Math.round(196 + (181 - 196) * t), // B: 196 -> 181
        240,
      ]
    } else if (normalizedValue < 0.8) {
      // Cyan to green
      const t = (normalizedValue - 0.6) / 0.2
      return [
        Math.round(35 + (65 - 35) * t), // R: 35 -> 65
        Math.round(161 + (182 - 161) * t), // G: 161 -> 182
        Math.round(181 + (96 - 181) * t), // B: 181 -> 96
        240,
      ]
    } else {
      // Green to yellow
      const t = (normalizedValue - 0.8) / 0.2
      return [
        Math.round(65 + (253 - 65) * t), // R: 65 -> 253
        Math.round(182 + (231 - 182) * t), // G: 182 -> 231
        Math.round(96 + (37 - 96) * t), // B: 96 -> 37
        240,
      ]
    }
  }

  // Calculate column radius based on debounced zoom level
  const getColumnRadius = useMemo(() => {
    if (debouncedZoom < 4) {
      return 20000 // Larger radius for zoomed out view
    } else if (debouncedZoom >= 4 && debouncedZoom <= 6) {
      return 8000 // Medium radius for mid-range zoom
    } else {
      return 3000 // Smaller radius for zoomed in view
    }
  }, [debouncedZoom])

  // Calculate grid size based on zoom level for square alignment
  const getGridSize = useMemo(() => {
    if (debouncedZoom < 4) {
      return 0.5 // Larger grid cells for zoomed out view
    } else if (debouncedZoom >= 4 && debouncedZoom <= 6) {
      return 0.2 // Medium grid cells
    } else {
      return 0.1 // Smaller grid cells for zoomed in view
    }
  }, [debouncedZoom])

  // Function to snap coordinates to grid
  const snapToGrid = (
    lng: number,
    lat: number,
    gridSize: number,
  ): [number, number] => {
    return [
      Math.round(lng / gridSize) * gridSize,
      Math.round(lat / gridSize) * gridSize,
    ]
  }

  // Only create layers when zoom is stable or on initial render
  const layers = useMemo(() => {
    if (isZooming && layerData.length > 500) {
      // During zooming with large datasets, return a simplified layer or previous layer
      // This prevents expensive recalculations during zoom operations
      return []
    }

    return [
      new ColumnLayer<ClusterData>({
        id: 'column-layer',
        data: layerData,
        getPosition: (d: ClusterData) => {
          // coordinates is [longitude, latitude]
          const [lng, lat] = d.coordinates
          // Snap to grid for square alignment
          //const [gridLng, gridLat] = snapToGrid(lng, lat, getGridSize)
          //return [gridLng, gridLat]
          return [lng, lat]
        },
        radius: getColumnRadius,
        updateTriggers: {
          radius: getColumnRadius,
          getPosition: getGridSize,
        },
        diskResolution: 4, // Use 4 sides to create square shapes
        elevationScale: 0, // Set to 0 to make it 2D (flat)
        getElevation: 0, // No elevation for 2D effect
        extruded: false, // Make it 2D instead of 3D
        pickable: true,
        autoHighlight: true,
        getFillColor: (d: ClusterData) => getColorFromCount(d.count),
      }),
    ]
  }, [
    layerData,
    getColumnRadius,
    isZooming,
    getColorFromCount,
    getGridSize,
    snapToGrid,
  ])

  const getTooltip = (info: any) => {
    if (!info.object) {
      return null
    }

    const cluster = info.object as ClusterData
    const [lng, lat] = cluster.coordinates
    const displayCount =
      cluster.count > 100 ? `${cluster.count} (100+)` : cluster.count.toString()

    return {
      html: `
        <div style="background-color: white; padding: 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <strong>Cluster Details</strong><br/>
          Specimen Count: ${displayCount}<br/>
          Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}
        </div>
      `,
    }
  }

  // Handle view state changes with throttling
  const handleViewStateChange = ({ viewState }: { viewState: any }) => {
    // Only update if zoom changed by a meaningful amount
    if (Math.abs(viewState.zoom - currentZoom) > 0.1) {
      setCurrentZoom(viewState.zoom)

      // Calculate more accurate bounding box based on the viewport
      const { longitude, latitude, zoom } = viewState

      // More accurate bounding box calculation using Web Mercator projection
      const earthCircumference = 40075016.686 // meters
      const metersPerPixel =
        (earthCircumference * Math.cos((latitude * Math.PI) / 180)) /
        Math.pow(2, zoom + 8)

      // Assume a standard map viewport size (roughly 800x600 pixels)
      const viewportWidth = 800
      const viewportHeight = 600

      const latOffset = (metersPerPixel * viewportHeight) / 2 / 111319.5 // Convert meters to degrees lat
      const lngOffset =
        (metersPerPixel * viewportWidth) /
        2 /
        (111319.5 * Math.cos((latitude * Math.PI) / 180)) // Convert meters to degrees lng

      const newBbox: [number, number, number, number] = [
        Math.max(-180, longitude - lngOffset), // west
        Math.max(-90, latitude - latOffset), // south
        Math.min(180, longitude + lngOffset), // east
        Math.min(90, latitude + latOffset), // north
      ]

      setBbox(newBbox)
    }
  }

  console.log(mapRef.current?.getBounds())

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

  if (layerData.length === 0) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center text-muted-foreground">
        No occurrences found for the current filters.
      </div>
    )
  }

  return (
    <div className="mt-6 relative h-[70vh] w-full rounded-lg overflow-hidden">
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
        <Map
          ref={mapRef}
          reuseMaps
          mapLib={maplibregl}
          mapStyle={GBIF_MAP_STYLE}
        />
      </DeckGL>
    </div>
  )
}
