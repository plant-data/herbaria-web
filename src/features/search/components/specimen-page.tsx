import Map, { Marker as MapLibreMarker } from 'react-map-gl/maplibre'
import type { SpecimenData } from '@/features/search/types/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MAP_STYLE } from '@/features/search/constants/constants'
import { BASE_IMAGE_URL } from '@/config'
import 'maplibre-gl/dist/maplibre-gl.css'


type SpecimenImageProps = Pick<SpecimenData, 'scientificName' | 'multimedia'>

type SpecimenMapProps = Pick<
  SpecimenData,
  'decimalLatitude' | 'decimalLongitude'
>

export function SpecimenPage({ occurrence }: { occurrence: SpecimenData }) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <h1 className="px-2 text-center sm:text-left sm:px-0 text-2xl sm:text-3xl font-bold mb-6">
        {occurrence.scientificName}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-[254px_1fr] md:grid-cols-[354px_1fr] gap-6">
        <div className="space-y-6">
          <SpecimenImage
            multimedia={occurrence.multimedia}
            scientificName={occurrence.scientificName}
          />
          <SpecimenMap
            decimalLatitude={occurrence.decimalLatitude}
            decimalLongitude={occurrence.decimalLongitude}
          />
        </div>
        <div className="space-y-6">
          <SpecimenData occurrence={occurrence} />
        </div>
      </div>
    </div>
  )
}

function SpecimenMap({ decimalLatitude, decimalLongitude }: SpecimenMapProps) {
  if (!decimalLatitude || !decimalLongitude) return null

  return (
    <Card className="rounded-md shadow-xs p-0 overflow-hidden">
      <CardContent className="p-1">
        <div className="h-64 w-full overflow-hidden rounded-[3px]">
          <Map
            initialViewState={{
              longitude: decimalLongitude,
              latitude: decimalLatitude,
              zoom: 2,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAP_STYLE}
            scrollZoom={false} // Disables zoom on scroll, similar to scrollWheelZoom={false}
          >
            <MapLibreMarker
              longitude={decimalLongitude}
              latitude={decimalLatitude}
              // No onClick needed if popup is managed by `showPopup` state and initially true
            />
          </Map>
        </div>
      </CardContent>
    </Card>
  )
}

export function SpecimenImage({
  multimedia,
  scientificName,
}: SpecimenImageProps) {
  return (
    <Card className="p-0 rounded-md shadow-xs max-w-[280px] sm:max-w-full mx-auto">
      <CardContent className="sm:w-[254px] sm:h-[370px] md:w-[352px] md:h-[500px] p-1 m-0">
        <div className="w-full h-full overflow-hidden rounded-[4px] border border-input">
          {multimedia.length > 0 ? (
            <img
              className="w-full h-full object-fill"
              src={`${BASE_IMAGE_URL}unsafe/704x1000/${multimedia[0].identifier}`}
              alt={scientificName}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function SpecimenData({ occurrence }: { occurrence: SpecimenData }) {
  return (
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
          <span className="ml-2">{occurrence.otherCatalogNumbers ?? '-'}</span>
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
          <span className="ml-2">{occurrence.verbatimEventDate ?? '-'}</span>
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
          <span className="ml-2">{occurrence.processedLocality ?? '-'}</span>
        </div>

        <div>
          <span className="font-medium">Latitude:</span>
          <span className="ml-2">{occurrence.decimalLatitude ?? '-'}</span>
        </div>
        <div>
          <span className="font-medium">Longitude:</span>
          <span className="ml-2">{occurrence.decimalLongitude ?? '-'}</span>
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
  )
}
