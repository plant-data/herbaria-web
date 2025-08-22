import { useContext, useRef, useState, useEffect } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { useRouter } from '@tanstack/react-router'
import { ArrowLeft, Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { Viewer, ViewerContext, ViewerProvider } from 'react-viewer-pan-zoom'
import { useTranslation } from 'react-i18next'
import type { SpecimenData } from '@/features/search/types/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ImageLightbox } from '@/components/image-lightbox'
import { FLORITALY_URL } from '@/features/search/constants/constants'
import { COUNTRIES } from '@/features/search/constants/countries'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { OpenSeaDragonMVP } from '@/components/test/openseadragon-mvp'

// Helper function to get country name from country code
const getCountryName = (countryCode: unknown): string => {
  if (!countryCode || typeof countryCode !== 'string') return '-'
  const country = COUNTRIES.find((c) => c.id === countryCode)
  return country ? country.value : countryCode
}

type SpecimenImageProps = Pick<SpecimenData, 'scientificName' | 'multimedia'>

type SpecimenMapProps = Pick<SpecimenData, 'decimalLatitude' | 'decimalLongitude'>

export function SpecimenPage({ occurrence }: { occurrence: SpecimenData }) {
  const router = useRouter()
  const backRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (backRef.current) {
      backRef.current.focus()
    }
  }, [])

  return (
    <div className="relative container mx-auto max-w-6xl px-4 py-6">
      <Button
        ref={backRef}
        variant="outline"
        onClick={() => router.history.back()}
        className="border-input bg-background absolute top-4 right-2 h-9 w-9 rounded-full border shadow-xs md:top-6 md:right-4"
      >
        <ArrowLeft className="size-4" />
      </Button>
      <h1 className="mb-6 px-2 text-center text-2xl font-bold sm:px-0 sm:text-left sm:text-3xl">
        {occurrence.scientificName}
      </h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[254px_1fr] md:grid-cols-[354px_1fr]">
        <div className="space-y-6">
          <SpecimenImage multimedia={occurrence.multimedia} scientificName={occurrence.scientificName} />
          <SpecimenMap decimalLatitude={occurrence.decimalLatitude} decimalLongitude={occurrence.decimalLongitude} />
        </div>
        <div className="space-y-6">
          <SpecimenData occurrence={occurrence} />
        </div>
      </div>
      <SpecimenOtherImages occurrence={occurrence} />
    </div>
  )
}

function SpecimenMap({ decimalLatitude, decimalLongitude }: SpecimenMapProps) {
  if (!decimalLatitude || !decimalLongitude) return null

  const position: [number, number] = [decimalLatitude, decimalLongitude]

  return (
    <Card className="overflow-hidden rounded-md p-0 shadow-xs">
      <CardContent className="p-1">
        <div className="h-64 w-full overflow-hidden rounded-[3px]">
          <MapContainer
            center={position}
            zoom={2}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
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

export function SpecimenImage({ multimedia, scientificName }: SpecimenImageProps) {
  // State to control the lightbox visibility and current image
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [currentImageIdentifier, setCurrentImageIdentifier] = useState('')

  const hasImage = multimedia.length > 0
  if (!hasImage) {
    return (
      <Card className="mx-auto max-w-[280px] rounded-md p-0 shadow-xs sm:max-w-full">
        <CardContent className="m-0 p-1 sm:h-[370px] sm:w-[254px] md:h-[500px] md:w-[352px]">
          <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-200">
            <span className="text-gray-500">No image available</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Define URLs for both the thumbnail and the full-resolution lightbox image
  const imageIdentifier = multimedia[0]
  const thumbnailUrl = imageIdentifier.thumbnailUrl
  const highResUrl = imageIdentifier.imageUrl

  const handleFullScreen = () => {
    setCurrentImageIdentifier(imageIdentifier.identifier)
    setIsLightboxOpen(true)
  }

  return (
    <>
      <Card className="mx-auto max-w-[280px] rounded-md p-0 shadow-xs sm:max-w-full">
        <ViewerProvider
          settings={{
            zoom: {
              enabled: true,
              default: 1,
              min: 1,
              max: 8,
              mouseWheelStep: 0,
              zoomButtonStep: 1,
            },
            resetView: {
              enabled: true,
              keyboardShortcut: 'r',
            },
            minimap: {
              enabled: true,
              width: '50px',
              keyboardShortcut: 'm',
              outlineStyle: '1px solid #ccc',
              viewportAreaOutlineStyle: '2px solid #333',
            },
            fillHeight: false,
          }}
        >
          <div className="flex w-full flex-col">
            <div className="flex-1 p-1">
              <div className="border-input h-[370px] w-full overflow-hidden rounded-[4px] border sm:h-[340px] md:h-[480px]">
                <Viewer
                  viewportContent={
                    <img
                      className="h-[370px] w-full object-contain will-change-transform sm:h-[340px] md:h-[480px]"
                      src={highResUrl}
                      alt={scientificName || 'Specimen Image'}
                      draggable="false"
                      style={{
                        width: '100%',
                        objectFit: 'fill',
                        objectPosition: 'center',
                      }}
                    />
                  }
                  minimapContent={
                    <img
                      className="h-[370px] w-full object-contain will-change-transform sm:h-[340px] md:h-[480px]"
                      src={thumbnailUrl}
                      alt={scientificName || 'Specimen Image'}
                      draggable="false"
                      style={{
                        width: '100%',
                        objectFit: 'fill',
                        objectPosition: 'center',
                      }}
                    />
                  }
                />
              </div>
            </div>
            <ImageViewerControls onFullScreen={handleFullScreen} />
          </div>
        </ViewerProvider>
      </Card>

      <ImageLightbox
        mediaData={multimedia}
        currentIdentifier={currentImageIdentifier}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={setCurrentImageIdentifier}
      />
    </>
  )
}

const ImageViewerControls = ({ onFullScreen }: { onFullScreen: () => void }) => {
  const { zoomOut, zoomIn, resetView, crop } = useContext(ViewerContext)

  return (
    <div className="border-input flex items-center justify-between border-t px-2 py-1">
      <div className="flex items-center gap-1">
        <button
          onClick={zoomOut}
          className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-200"
          aria-label="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <span className="min-w-[2.5rem] text-center text-xs font-medium">{(crop.zoom * 100).toFixed(0)}%</span>
        <button
          onClick={zoomIn}
          className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-200"
          aria-label="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={resetView}
          className="ml-1 cursor-pointer rounded p-1 transition-colors hover:bg-gray-200"
          aria-label="Reset View"
        >
          <RotateCcw size={16} />
        </button>
      </div>
      <button
        onClick={onFullScreen}
        className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-200"
        aria-label="Full Screen"
      >
        <Maximize2 size={16} />
      </button>
    </div>
  )
}

export function SpecimenData({ occurrence }: { occurrence: SpecimenData }) {
  const { t } = useTranslation()

  return (
    <Card className="gap-2 rounded-md shadow-xs">
      <CardHeader>
        <CardTitle className="text-xl">LABEL DATA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {/* Taxonomic Information */}
        <div>
          <span className="font-medium">Scientific Name</span>
          <span className="ml-2">{occurrence.scientificName ?? '-'}</span>
        </div>
        <div>
          <span className="font-medium">GBIF Name:</span>
          <span className="ml-2">{occurrence.gbifName ?? '-'}</span>
        </div>
        <div className="flex h-6 flex-wrap items-center">
          <div>
            <span className="font-medium">Floritaly Name:</span>
            <span className="ml-2">{occurrence.floritalyName ?? '-'}</span>
          </div>
          {occurrence.floritalyID ? (
            <Button asChild className="ml-2 h-6 gap-1 px-2 py-1">
              <span>
                <img src="/images/flor.png" alt="Herbaria Logo" width={18} height={18} className=""></img>
                <a className="text-xs" target="_blank" href={`${FLORITALY_URL}${occurrence.floritalyID}`}>
                  Open taxon page
                </a>
              </span>
            </Button>
          ) : null}
        </div>
        <div>
          <span className="font-medium">Verbatim Identification:</span>
          <span className="ml-2">{occurrence.verbatimIdentification ?? '-'}</span>
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
        <div>
          <span className="font-medium">Country:</span>

          <span className="ml-2">
            {getCountryName(occurrence.countryCode) === '-' ? '-' : t(getCountryName(occurrence.countryCode))}
          </span>
        </div>
        <div>
          <span className="font-medium">Country Code:</span>
          <span className="ml-2">{typeof occurrence.countryCode === 'string' ? occurrence.countryCode : '-'}</span>
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
          <span className="ml-2">{occurrence.coordinatesUncertaintyInMeters ?? '-'}</span>
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
              {occurrence.minimumElevationInMeters ? `${occurrence.minimumElevationInMeters}m` : '-'}
            </span>
          </div>

          <div>
            <span className="font-medium">Maximum Elevation:</span>
            <span className="ml-2">
              {occurrence.maximumElevationInMeters ? `${occurrence.maximumElevationInMeters}m` : '-'}
            </span>
          </div>
        </>
      </CardContent>
    </Card>
  )
}

export function SpecimenOtherImages({ occurrence }: { occurrence: SpecimenData }) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [currentImageIdentifier, setCurrentImageIdentifier] = useState('')
  
  // Filter out primary images to show only additional images
  const imagesData = occurrence.multimedia.filter((image) => image.imageRole !== 'primary')

  if (imagesData.length === 0) {
    return null
  }

  const handleImageClick = (identifier: string) => {
    setCurrentImageIdentifier(identifier)
    setIsLightboxOpen(true)
  }

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-lg font-semibold">Additional Images</h3>
      <div className="flex flex-wrap gap-4">
        {imagesData.map((imageData) => (
          <div key={imageData.identifier} className="flex-shrink-0">
            <Button
              variant="ghost"
              className="h-auto p-0 hover:opacity-80"
              onClick={() => handleImageClick(imageData.identifier)}
            >
              <img
                className="h-32 w-32 rounded-md object-cover shadow-sm transition-opacity sm:h-40 sm:w-40"
                src={imageData.thumbnailUrl}
                alt={imageData.imageRole || 'Specimen Image'}
                draggable="false"
              />
            </Button>
          </div>
        ))}
      </div>
      
      <ImageLightbox
        mediaData={occurrence.multimedia}
        currentIdentifier={currentImageIdentifier}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={setCurrentImageIdentifier}
      />
      <div>
        <OpenSeaDragonMVP imgUrl={occurrence.multimedia[0]?.imageUrl} />
      </div>
    </div>
  )
}