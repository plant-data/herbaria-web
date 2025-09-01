import { useRef, useState, useEffect } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { useRouter } from '@tanstack/react-router'
import { ArrowLeft, Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import OpenSeadragon from 'openseadragon'
import type { SpecimenData } from '@/features/search/types/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ImageLightbox } from '@/components/image-lightbox'
import { FLORITALY_URL } from '@/features/search/constants/constants'
import { COUNTRIES } from '@/features/search/constants/countries'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { BASE_PATH } from '@/config'

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
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <div className='grid grid-cols-[1fr_2.5rem] mb-6 items-center'>
        <h1 className="px-2  text-2xl font-bold sm:px-0  sm:text-3xl">
          {occurrence.scientificName}
        </h1>

        <Button
          ref={backRef}
          variant="outline"
          onClick={() => router.history.back()}
          className="border-input bg-background h-9 w-9 rounded-full border shadow-xs"
        >
          <ArrowLeft className="size-4" />
        </Button>
      </div>
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
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [currentImageIdentifier, setCurrentImageIdentifier] = useState('')
  const [zoomPercentage, setZoomPercentage] = useState(100)

  const hasImage = multimedia.length > 0

  useEffect(() => {
    if (!hasImage) return

    const imageData = multimedia[0]
    const viewer = OpenSeadragon({
      id: 'specimen-seadragon-viewer',
      tileSources: {
        type: 'image',
        url: imageData.imageUrl,
      },
      prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
      showNavigator: true,
      navigatorPosition: 'BOTTOM_RIGHT',
      navigatorSizeRatio: 0.2,
      navigatorMaintainSizeRatio: true,
      navigatorBackground: '#fff',
      navigatorOpacity: 0.8,
      navigatorBorderColor: '#fff',
      navigatorDisplayRegionColor: '#333',
      maxZoomLevel: 8,
      minZoomLevel: 1,
      defaultZoomLevel: 1,
      showZoomControl: false,
      showHomeControl: false,
      showFullPageControl: false,
      showSequenceControl: false,
      animationTime: 0.5,
      springStiffness: 10,
      imageLoaderLimit: 2,
      timeout: 120000,
      useCanvas: true,
      preserveImageSizeOnResize: true,
      visibilityRatio: 1,
      constrainDuringPan: true,
      wrapHorizontal: false,
      wrapVertical: false,
      panHorizontal: true,
      panVertical: true,
      showNavigationControl: false,
      sequenceMode: false,
    })

    viewerRef.current = viewer

    // Update zoom percentage when zoom changes
    viewer.addHandler('zoom', () => {
      const zoom = viewer.viewport.getZoom()
      const homeZoom = viewer.viewport.getHomeZoom()
      const percentage = Math.round((zoom / homeZoom) * 100)
      setZoomPercentage(percentage)
    })

    return () => {
      viewerRef.current?.destroy()
    }
  }, [hasImage, multimedia])

  const handleZoomIn = () => {
    if (viewerRef.current) {
      viewerRef.current.viewport.zoomBy(1.5)
    }
  }

  const handleZoomOut = () => {
    if (viewerRef.current) {
      viewerRef.current.viewport.zoomBy(0.67)
    }
  }

  const handleResetView = () => {
    if (viewerRef.current) {
      viewerRef.current.viewport.goHome()
    }
  }

  const handleFullScreen = () => {
    if (hasImage) {
      setCurrentImageIdentifier(multimedia[0].identifier)
      setIsLightboxOpen(true)
    }
  }

  if (!hasImage) {
    return (
      <Card className="mx-auto rounded-md p-0 shadow-xs max-w-full">
        <CardContent className="m-0 p-1 sm:h-[370px] sm:w-[254px] md:h-[500px] md:w-[352px]">
          <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-200">
            <span className="text-gray-500">No image available</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="mx-auto rounded-md p-0 shadow-xs max-w-full">
        <div className="flex w-full flex-col">
          <div className="flex flex-1 p-1 justify-center">
            <div className="max-w-[250px] sm:max-w-full border-input h-[370px] w-full overflow-hidden rounded-[4px] border sm:h-[340px] sm:w-[250px] md:h-[480px] md:w-[350px]">
              <div 
                id="specimen-seadragon-viewer" 
                className="h-full w-full"
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </div>
          </div>
          <div className="border-input flex items-center justify-between border-t px-2 py-1">
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-200"
                aria-label="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="min-w-[2.5rem] text-center text-xs font-medium">
                {zoomPercentage}%
              </span>
              <button
                onClick={handleZoomIn}
                className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-200"
                aria-label="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={handleResetView}
                className="ml-1 cursor-pointer rounded p-1 transition-colors hover:bg-gray-200"
                aria-label="Reset View"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <button
              onClick={handleFullScreen}
              className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-200"
              aria-label="Full Screen"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
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
                <img src={`${BASE_PATH}images/flor.png`} alt="Herbaria Logo" width={18} height={18} className=""></img>
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
      <h3 className="mb-4 text-xl font-medium ">Additional Images</h3>
      <div className="flex flex-wrap gap-4">
        {imagesData.map((imageData) => (
          <div key={imageData.identifier} className="flex-shrink-0">
            <Button
              variant="ghost"
              className="h-auto p-0 hover:opacity-80"
              onClick={() => handleImageClick(imageData.identifier)}
            >
              <img
                className="h-[150px] w-[110px] sm:h-[300px] sm:w-[220px] rounded-md object-cover shadow-sm transition-opacity"
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
    </div>
  )
}