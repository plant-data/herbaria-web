import { useEffect, useRef, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { ArrowLeft, MapPinIcon, Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import OpenSeadragon from 'openseadragon'
import type { SpecimenData } from '@/features/search/types/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Map, MapLayers, MapMarker, MapTileLayer, MapZoomControl } from '@/components/ui/map'
import { Separator } from '@/components/ui/separator'
import { ImageLightbox } from '@/components/image-lightbox'
import { FLORITALY_URL } from '@/features/search/constants/constants'
import { COUNTRIES } from '@/features/search/constants/countries'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
      <div className="mb-6 grid grid-cols-[1fr_2.5rem] items-center">
        <h1 className="px-2 text-2xl font-bold sm:px-0 sm:text-3xl">{occurrence.scientificName}</h1>

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
  const { t } = useTranslation()
  const position: [number, number] | null =
    decimalLatitude && decimalLongitude ? [decimalLatitude, decimalLongitude] : null

  return (
    <Card className="overflow-hidden rounded-md p-0 shadow-xs">
      <CardContent className="p-1">
        <div className="h-64 w-full overflow-hidden rounded-xs">
          {position ? (
            <Map center={position} zoom={2} className="z-0 h-full min-h-0 w-full">
              <MapLayers>
                <MapTileLayer />
                <MapMarker position={position} icon={<MapPinIcon className="text-primary size-6" />} />
              </MapLayers>
              <MapZoomControl />
            </Map>
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center rounded-sm">
              <span className="text-muted-foreground">{t('specimen.not-georeferenced')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function SpecimenImage({ multimedia }: SpecimenImageProps) {
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [currentImageIdentifier, setCurrentImageIdentifier] = useState('')
  const [zoomPercentage, setZoomPercentage] = useState(100)

  const hasImage = multimedia.length > 0

  useEffect(() => {
    if (!hasImage) return
    const imageData = multimedia.find((media) => media.imageRole === 'primary')
    if (!imageData) return

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
      setCurrentImageIdentifier(multimedia.find((media) => media.imageRole === 'primary')?.identifier || '')
      setIsLightboxOpen(true)
    }
  }

  const { t } = useTranslation()

  if (!hasImage) {
    return (
      <Card className="mx-auto max-w-full rounded-md p-0 shadow-xs">
        <CardContent className="m-0 p-1 sm:h-[370px] sm:w-[254px] md:h-[500px] md:w-[352px]">
          <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-200">
            <span className="text-gray-500">{t('specimen.no-image')}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="mx-auto max-w-full rounded-md p-0 shadow-xs">
        <div className="flex w-full flex-col">
          <div className="flex flex-1 justify-center p-1">
            <div className="border-input h-[370px] w-full max-w-[250px] overflow-hidden rounded-[4px] border sm:h-[340px] sm:w-[250px] sm:max-w-full md:h-[480px] md:w-[350px]">
              <div id="specimen-seadragon-viewer" className="h-full w-full" style={{ backgroundColor: '#f5f5f5' }} />
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
              <span className="min-w-[2.5rem] text-center text-xs font-medium">{zoomPercentage}%</span>
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
  const [showDarwinCore, setShowDarwinCore] = useState(false)

  // Helper to get label based on Darwin Core mode
  const getLabel = (translationKey: string, dwcTerm: string | null): string => {
    if (showDarwinCore && dwcTerm) {
      return `dwc:${dwcTerm}`
    }
    return t(`specimen.fields.${translationKey}` as never) as string
  }

  return (
    <Card className="gap-2 rounded-md shadow-xs">
      <CardHeader>
        <CardTitle className="text-xl">{t('specimen.label-data').toUpperCase()}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {/* Taxonomic Information */}
        <div>
          <span className="font-medium">{getLabel('scientific-name', 'scientificName')}:</span>
          <span className="ml-2">{occurrence.scientificName ?? '-'}</span>
        </div>

        <div>
          <span className="font-medium">{getLabel('verbatim-identification', 'verbatimIdentification')}:</span>
          <span className="ml-2">{occurrence.verbatimIdentification ?? '-'}</span>
        </div>
        {/* Collection Information */}
        <div>
          <span className="font-medium">{getLabel('catalog-number', 'catalogNumber')}:</span>
          <span className="ml-2">{occurrence.catalogNumber ?? '-'}</span>
        </div>
        <div>
          <span className="font-medium">{getLabel('other-catalog-numbers', 'otherCatalogNumbers')}:</span>
          <span className="ml-2">{occurrence.otherCatalogNumbers ?? '-'}</span>
        </div>
        <div>
          <span className="font-medium">{getLabel('basis-of-record', 'basisOfRecord')}:</span>
          <span className="ml-2">{occurrence.basisOfRecord ?? '-'}</span>
        </div>
        <div>
          <span className="font-medium">{getLabel('recorded-by', 'recordedBy')}:</span>
          <span className="ml-2">{occurrence.recordedBy ?? '-'}</span>
        </div>
        <div>
          <span className="font-medium">{getLabel('identified-by', 'identifiedBy')}:</span>
          <span className="ml-2">{occurrence.identifiedBy ?? '-'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div>
            <span className="font-medium">{getLabel('floritaly-name', null)}:</span>
            <span className="ml-2">{occurrence.floritalyName ?? '-'}</span>
          </div>
          {occurrence.floritalyID ? (
            <Button asChild className="h-6 gap-1 px-2 py-1">
              <a className="text-xs" target="_blank" href={`${FLORITALY_URL}${occurrence.floritalyID}`}>
                <img src={`${BASE_PATH}images/flor.png`} alt="Herbaria Logo" width={18} height={18} className=""></img>
                {t('specimen.open-taxon-page')}
              </a>
            </Button>
          ) : null}
        </div>

        <Separator />
        {/* Date Information */}
        <div>
          <span className="font-medium">{getLabel('year', 'year')}:</span>
          <span className="ml-2">{occurrence.year ?? '-'}</span>
        </div>
        <div>
          <span className="font-medium">{getLabel('month', 'month')}:</span>
          <span className="ml-2">{occurrence.month ?? '-'}</span>
        </div>
        <div>
          <span className="font-medium">{getLabel('event-date', 'eventDate')}:</span>
          <span className="ml-2">{occurrence.eventDate ?? '-'}</span>
        </div>
        <div>
          <span className="font-medium">{getLabel('verbatim-event-date', 'verbatimEventDate')}:</span>
          <span className="ml-2">{occurrence.verbatimEventDate ?? '-'}</span>
        </div>
        <Separator />
        <div>
          <span className="font-medium">{getLabel('country', 'country')}:</span>
          <span className="ml-2">
            {getCountryName(occurrence.countryCode) === '-' ? '-' : t(getCountryName(occurrence.countryCode) as never)}
          </span>
        </div>
        <div>
          <span className="font-medium">{getLabel('country-code', 'countryCode')}:</span>
          <span className="ml-2">{typeof occurrence.countryCode === 'string' ? occurrence.countryCode : '-'}</span>
        </div>
        <div>
          <span className="font-medium">{getLabel('verbatim-locality', 'verbatimLocality')}:</span>
          <span className="ml-2">{String(occurrence.verbatimLocality ?? '-')}</span>
        </div>
        <div>
          <span className="font-medium">{getLabel('locality', 'locality')}:</span>
          <span className="ml-2">{occurrence.locality ?? '-'}</span>
        </div>
        <div>
          <span className="font-medium">{getLabel('latitude', 'decimalLatitude')}:</span>
          <span className="ml-2">{occurrence.decimalLatitude ?? '-'}</span>
        </div>
        <div>
          <span className="font-medium">{getLabel('longitude', 'decimalLongitude')}:</span>
          <span className="ml-2">{occurrence.decimalLongitude ?? '-'}</span>
        </div>
        <div>
          <span className="font-medium">{getLabel('geodetic-datum', 'geodeticDatum')}:</span>
          <span className="ml-2">{occurrence.geodeticDatum ?? '-'}</span>
        </div>
        <div>
          <span className="font-medium">{getLabel('coordinates-uncertainty', 'coordinateUncertaintyInMeters')}:</span>
          <span className="ml-2">{occurrence.coordinatesUncertaintyInMeters ?? '-'}</span>
        </div>
        {occurrence.georeferenceProtocol && (
          <div>
            <span className="font-medium">{getLabel('georeference-protocol', 'georeferenceProtocol')}:</span>
            <span className="ml-2">{occurrence.georeferenceProtocol}</span>
          </div>
        )}
        <>
          <Separator />
          {occurrence.verbatimElevation && (
            <div>
              <span className="font-medium">{getLabel('verbatim-elevation', 'verbatimElevation')}:</span>
              <span className="ml-2">{occurrence.verbatimElevation}</span>
            </div>
          )}

          <div>
            <span className="font-medium">{getLabel('minimum-elevation', 'minimumElevationInMeters')}:</span>
            <span className="ml-2">
              {occurrence.minimumElevationInMeters ? `${occurrence.minimumElevationInMeters}m` : '-'}
            </span>
          </div>

          <div>
            <span className="font-medium">{getLabel('maximum-elevation', 'maximumElevationInMeters')}:</span>
            <span className="ml-2">
              {occurrence.maximumElevationInMeters ? `${occurrence.maximumElevationInMeters}m` : '-'}
            </span>
          </div>
        </>

        <Separator />
        {/* Darwin Core Terms Switch */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Label htmlFor="darwin-core-switch" className="text-muted-foreground text-xs">
            {showDarwinCore ? t('specimen.show-darwin-core-terms') : t('specimen.show-common-terms')}
          </Label>
          <Switch id="darwin-core-switch" checked={showDarwinCore} onCheckedChange={setShowDarwinCore} />
        </div>
      </CardContent>
    </Card>
  )
}

export function SpecimenOtherImages({ occurrence }: { occurrence: SpecimenData }) {
  const { t } = useTranslation()
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
      <h3 className="mb-4 text-xl font-medium">{t('specimen.other-images')}</h3>
      <div className="flex w-full flex-wrap gap-4 lg:gap-8">
        {imagesData.map((imageData) => (
          <div key={imageData.identifier} className="flex flex-shrink-0 flex-col items-center">
            <Button
              variant="ghost"
              className="h-auto p-0 hover:opacity-80"
              onClick={() => handleImageClick(imageData.identifier)}
            >
              <img
                className="h-[150px] w-[110px] rounded-md object-cover shadow-sm transition-opacity sm:h-[300px] sm:w-[220px]"
                src={imageData.thumbnailUrl}
                alt={imageData.imageRole || 'Specimen Image'}
                draggable="false"
              />
            </Button>
            <span className="mt-2 text-sm text-gray-600">{imageData.imageRole || '-'}</span>
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
