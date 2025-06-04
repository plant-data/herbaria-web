import { createFileRoute } from '@tanstack/react-router'
import Map, { Marker as MapLibreMarker } from 'react-map-gl/maplibre'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import 'maplibre-gl/dist/maplibre-gl.css'

export const Route = createFileRoute('/specimens/$occurrenceID')({
  loader: async ({ params }) => {
    const response = await fetch(
      `http://localhost:8000/api/v1/occurrences/${params.occurrenceID}`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch occurrence data')
    }
    return response.json()
  },
  component: OccurrenceDetail,
})

function OccurrenceDetail() {
  const occurrence = Route.useLoaderData()

  const hasCoordinates =
    occurrence.decimalLatitude && occurrence.decimalLongitude

  let initialLongitude, initialLatitude
  if (hasCoordinates) {
    initialLongitude = parseFloat(occurrence.decimalLongitude)
    initialLatitude = parseFloat(occurrence.decimalLatitude)
  }

  const mapStyle = {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    },
    layers: [
      {
        id: 'osm',
        type: 'raster',
        source: 'osm',
        minzoom: 0,
        maxzoom: 22, // Or your preferred max zoom
      },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <h1 className="px-2 text-center sm:text-left sm:px-0 text-2xl sm:text-3xl font-bold mb-6">
        {occurrence.scientificName}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-[254px_1fr] md:grid-cols-[354px_1fr] gap-6">
        {/* Left Column - Main Information */}
        <div className="space-y-6">
          {/* Image Placeholder Card */}
          <Card className="p-0 rounded-md shadow-xs max-w-[280px] sm:max-w-full mx-auto">
            <CardContent className="sm:w-[254px] sm:h-[370px] md:w-[352px] md:h-[500px] p-1 m-0">
              <div className='w-full h-full overflow-hidden rounded-[4px] border border-input'>
                {occurrence.multimedia && occurrence.multimedia.length > 0 ? (
                  <img
                    className="w-full h-full object-fill"
                    src={`http://137.204.21.175:8000/unsafe/704x1000/${occurrence.multimedia[0].identifier}`}
                    alt={occurrence.scientificName}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Map Card with react-map-gl/maplibre */}
          {hasCoordinates && initialLongitude && initialLatitude && (
            <Card className="rounded-md shadow-xs p-0 overflow-hidden">
              <CardContent className="p-1">
                <div className="h-64 w-full overflow-hidden rounded-[3px]">
                  <Map
                    initialViewState={{
                      longitude: initialLongitude,
                      latitude: initialLatitude,
                      zoom: 2, // Adjusted zoom for better initial view
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle={mapStyle}
                    scrollZoom={false} // Disables zoom on scroll, similar to scrollWheelZoom={false}
                  >
                    <MapLibreMarker
                      longitude={initialLongitude}
                      latitude={initialLatitude}
                      // No onClick needed if popup is managed by `showPopup` state and initially true
                    />
                  </Map>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Specimen Data */}
        <div className="space-y-6">
          {/* Specimen Data Card */}
          <Card className="rounded-md shadow-xs">
            <CardHeader>
              <CardTitle className="text-xl">LABEL DATA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Taxonomic Information */}
              <div>
                <span className="font-medium">Scientific Name</span>
                <span className="ml-2">{occurrence.scientificName ?? '-'}</span>
              </div>
              <div>
                <span className="font-medium">GBIF Name:</span>
                <span className="ml-2">{occurrence.gbifName ?? '-'}</span>
              </div>

              <div>
                <span className="font-medium">Floritaly Name:</span>
                <span className="ml-2">{occurrence.floritalyName ?? '-'}</span>
              </div>

              <div>
                <span className="font-medium">Verbatim Identification:</span>
                <span className="ml-2">
                  {occurrence.verbatimIdentification ?? '-'}
                </span>
              </div>

              {/* Collection Information */}
              <div>
                <span className="font-medium">Catalog Number:</span>
                <span className="ml-2">{occurrence.catalogNumber ?? '-'}</span>
              </div>

              <div>
                <span className="font-medium">Other Catalog Numbers:</span>
                <span className="ml-2">
                  {occurrence.otherCatalogNumbers ?? '-'}
                </span>
              </div>

              <div>
                <span className="font-medium">Basis of Record:</span>
                <span className="ml-2">{occurrence.basisOfRecord ?? '-'}</span>
              </div>

              <div>
                <span className="font-medium">Recorded By:</span>
                <span className="ml-2">{occurrence.recordedBy ?? '-'}</span>
              </div>

              <div>
                <span className="font-medium">Identified By:</span>
                <span className="ml-2">{occurrence.identifiedBy ?? '-'}</span>
              </div>

              <Separator />

              {/* Date Information */}
              <div>
                <span className="font-medium">Year:</span>
                <span className="ml-2">{occurrence.year ?? '-'}</span>
              </div>

              <div>
                <span className="font-medium">Month:</span>
                <span className="ml-2">{occurrence.month ?? '-'}</span>
              </div>

              <div>
                <span className="font-medium">Event Date:</span>
                <span className="ml-2">{occurrence.eventDate ?? '-'}</span>
              </div>

              <div>
                <span className="font-medium">Verbatim Event Date:</span>
                <span className="ml-2">
                  {occurrence.verbatimEventDate ?? '-'}
                </span>
              </div>

              <Separator />

              {/* Location Information */}
              <div>
                <span className="font-medium">Country:</span>
                <span className="ml-2">{occurrence.country}</span>
              </div>
              <div>
                <span className="font-medium">verbatimLocality:</span>
                <span className="ml-2">{occurrence.locality}</span>
              </div>

              <div>
                <span className="font-medium">Locality:</span>
                <span className="ml-2">
                  {occurrence.processedLocality ?? '-'}
                </span>
              </div>

              <div>
                <span className="font-medium">Latitude:</span>
                <span className="ml-2">
                  {occurrence.decimalLatitude ?? '-'}
                </span>
              </div>
              <div>
                <span className="font-medium">Longitude:</span>
                <span className="ml-2">
                  {occurrence.decimalLongitude ?? '-'}
                </span>
              </div>
              <div>
                <span className="font-medium">Geodetic Datum:</span>
                <span className="ml-2">{occurrence.geodeticDatum ?? '-'}</span>
              </div>
              <div>
                <span className="font-medium">Coordinates Uncertainty:</span>
                <span className="ml-2">
                  {occurrence.coordinatesUncertaintyInMeters ?? '-'}m
                </span>
              </div>
              {occurrence.georeferenceProtocol && (
                <div>
                  <span className="font-medium">Georeference Protocol:</span>
                  <span className="ml-2">
                    {occurrence.georeferenceProtocol ?? '-'}
                  </span>
                </div>
              )}

              <>
                <Separator />
                {occurrence.verbatimElevation && (
                  <div>
                    <span className="font-medium">Verbatim Elevation:</span>
                    <span className="ml-2">
                      {occurrence.verbatimElevation ?? '-'}
                    </span>
                  </div>
                )}

                <div>
                  <span className="font-medium">Minimum Elevation:</span>
                  <span className="ml-2">
                    {occurrence.minimumElevationInMeters
                      ? `${occurrence.minimumElevationInMeters}m`
                      : '-'}
                  </span>
                </div>

                <div>
                  <span className="font-medium">Maximum Elevation:</span>
                  <span className="ml-2">
                    {occurrence.maximumElevationInMeters
                      ? `${occurrence.maximumElevationInMeters}m`
                      : '-'}
                  </span>
                </div>
              </>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
