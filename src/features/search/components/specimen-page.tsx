import { useContext, useState } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { useRouter } from '@tanstack/react-router'
import { ArrowLeft, Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { Viewer, ViewerContext, ViewerProvider } from 'react-viewer-pan-zoom'
import type { SpecimenData } from '@/features/search/types/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ImageLightbox } from '@/components/image-lightbox'
import { BASE_IMAGE_URL } from '@/config'
import 'leaflet/dist/leaflet.css' // Import Leaflet's CSS
import { Button } from '@/components/ui/button'

type SpecimenImageProps = Pick<SpecimenData, 'scientificName' | 'multimedia'>

type SpecimenMapProps = Pick<
  SpecimenData,
  'decimalLatitude' | 'decimalLongitude'
>

export function SpecimenPage({ occurrence }: { occurrence: SpecimenData }) {
  const router = useRouter()

  return (
    <div className="relative container mx-auto px-4 py-6 max-w-6xl">
      <Button
        variant="outline"
        onClick={() => router.history.back()}
        className="absolute top-4 right-2 md:top-6 md:right-4 h-9 w-9 rounded-full border border-input shadow-xs bg-background"
      >
        <ArrowLeft className="size-4" />
      </Button>
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

  const position: [number, number] = [decimalLatitude, decimalLongitude]

  return (
    <Card className="rounded-md shadow-xs p-0 overflow-hidden">
      <CardContent className="p-1">
        <div className="h-64 w-full overflow-hidden rounded-[3px]">
          <MapContainer
            center={position}
            zoom={2}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}></Marker>
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function SpecimenImage({
  multimedia,
  scientificName,
}: SpecimenImageProps) {
  // State to control the lightbox visibility
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const hasImage = multimedia.length > 0
  if (!hasImage) {
    return (
      <Card className="p-0 rounded-md shadow-xs max-w-[280px] sm:max-w-full mx-auto">
        <CardContent className="sm:w-[254px] sm:h-[370px] md:w-[352px] md:h-[500px] p-1 m-0">
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
            <span className="text-gray-500">No image available</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Define URLs for both the thumbnail and the full-resolution lightbox image
  const imageIdentifier = multimedia[0].identifier
  const thumbnailUrl = `${BASE_IMAGE_URL}unsafe/0x0/${imageIdentifier}`
  const highResUrl = `${BASE_IMAGE_URL}unsafe/0x0/${imageIdentifier}` // Use max resolution for lightbox

  return (
    <>
      <Card className="p-0 rounded-md shadow-xs max-w-[280px] sm:max-w-full mx-auto">
        <ViewerProvider
          settings={{
            zoom: {
              enabled: true,
              default: 1,
              min: 1,
              max: 4,
              mouseWheelStep: 0.5,
              zoomButtonStep: 0.5,
            },
            resetView: {
              enabled: true,
              keyboardShortcut: 'r',
            },
            minimap: {
              enabled: false,
              width: '160px',
              keyboardShortcut: 'm',
              outlineStyle: '1px solid #ccc',
              viewportAreaOutlineStyle: '2px solid #333',
            },
            fillHeight: false,
          }}
        >
          <div className="w-full  flex flex-col">
            <div className="flex-1 p-1">
              <div className="w-full  sm:h-[370px]  md:h-[500px]  overflow-hidden rounded-[4px] border border-input">
                <Viewer
                  viewportContent={
                    <img
                      className="w-full h-full object-contain will-change-transform"
                      src={thumbnailUrl}
                      alt={scientificName || 'Specimen Image'}
                      draggable="false"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center',
                      }}
                    />
                  }
                  minimapContent={<></>}
                />
              </div>
            </div>
            <ImageViewerControls onFullScreen={() => setIsLightboxOpen(true)} />
          </div>
        </ViewerProvider>
      </Card>

      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        src={highResUrl}
        alt={scientificName ? scientificName : 'Specimen Image'}
      />
    </>
  )
}

const ImageViewerControls = ({
  onFullScreen,
}: {
  onFullScreen: () => void
}) => {
  const { zoomOut, zoomIn, resetView, crop } = useContext(ViewerContext)

  return (
    <div className="flex items-center justify-between px-2 py-1 border-t border-input">
      <div className="flex items-center gap-1">
        <button
          onClick={zoomOut}
          className="p-1 rounded hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-medium min-w-[2.5rem] text-center">
          {(crop.zoom * 100).toFixed(0)}%
        </span>
        <button
          onClick={zoomIn}
          className="p-1 rounded hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={resetView}
          className="p-1 rounded hover:bg-gray-200 transition-colors ml-1 cursor-pointer"
          aria-label="Reset View"
        >
          <RotateCcw size={16} />
        </button>
      </div>
      <button
        onClick={onFullScreen}
        className="p-1 rounded hover:bg-gray-200 transition-colors cursor-pointer"
        aria-label="Full Screen"
      >
        <Maximize2 size={16} />
      </button>
    </div>
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
            <span className="ml-2">{occurrence.georeferenceProtocol}</span>
          </div>
        )}

        <>
          <Separator />
          {occurrence.verbatimElevation && (
            <div>
              <span className="font-medium">Verbatim Elevation:</span>
              <span className="ml-2">{occurrence.verbatimElevation}</span>
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
