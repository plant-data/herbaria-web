import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import OpenSeaDragon from 'openseadragon'
import { ZoomIn, ZoomOut, RotateCcw, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface MultimediaData {
  imageUrl: string
  identifier: string
  [key: string]: any
}

interface ImageLightboxProps {
  mediaData: Array<MultimediaData>
  currentIdentifier: string
  isOpen: boolean
  onClose: () => void
  onNavigate?: (identifier: string) => void
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  mediaData,
  currentIdentifier,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null)
  const viewerInstance = useRef<OpenSeaDragon.Viewer | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoomPercentage, setZoomPercentage] = useState(100)

  // Find current index based on identifier
  useEffect(() => {
    const index = mediaData.findIndex((item) => item.identifier === currentIdentifier)
    if (index !== -1) {
      setCurrentIndex(index)
    }
  }, [currentIdentifier, mediaData])

  // Initialize OpenSeaDragon viewer
  useEffect(() => {
    if (!isOpen || !viewerRef.current || !mediaData.length) return

    const currentItem = mediaData[currentIndex]
    if (!currentItem) return

    // Destroy existing viewer
    if (viewerInstance.current) {
      viewerInstance.current.destroy()
      viewerInstance.current = null
    }

    try {
      viewerInstance.current = OpenSeaDragon({
        element: viewerRef.current,
        tileSources: {
          type: 'image',
          url: currentItem.imageUrl,
        },
        prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        navigatorSizeRatio: 0.15,
        navigatorMaintainSizeRatio: true,
        navigatorBackground: '#000',
        navigatorOpacity: 0.8,
        navigatorBorderColor: '#fff',
        navigatorDisplayRegionColor: '#900',
        maxZoomLevel: 10,
        minZoomLevel: 0,
        defaultZoomLevel: 0, // 0 means fit to viewer
        zoomInButton: 'zoom-in-btn',
        zoomOutButton: 'zoom-out-btn',
        homeButton: 'home-btn',
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
        immediateRender: true,
        homeFillsViewer: false,
        minZoomImageRatio: 1,
        maxZoomPixelRatio: 10,
      })

      // Add custom styling to navigator
      viewerInstance.current.addHandler('open', () => {
        const navigator = viewerInstance.current?.navigator?.element
        if (navigator) {
          navigator.style.border = '2px solid #555'
          navigator.style.borderRadius = '4px'
          navigator.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
        }

        // Ensure the image fits height on open
        /* if (viewerInstance.current) {
          const viewport = viewerInstance.current.viewport;
          viewport.fitVertically();
          viewport.applyConstraints();
        } */
      })

      // Update zoom percentage when zoom changes
      viewerInstance.current.addHandler('zoom', () => {
        if (!viewerInstance.current) return
        const zoom = viewerInstance.current.viewport.getZoom()
        const homeZoom = viewerInstance.current.viewport.getHomeZoom()
        const percentage = Math.round((zoom / homeZoom) * 100)
        setZoomPercentage(percentage)
      })
    } catch (error) {
      console.error('Failed to initialize OpenSeaDragon:', error)
    }

    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.destroy()
        viewerInstance.current = null
      }
    }
  }, [isOpen, currentIndex, mediaData])

  // Zoom control functions
  const handleZoomIn = () => {
    if (viewerInstance.current) {
      viewerInstance.current.viewport.zoomBy(1.5)
    }
  }

  const handleZoomOut = () => {
    if (viewerInstance.current) {
      viewerInstance.current.viewport.zoomBy(0.67)
    }
  }

  const handleResetView = () => {
    if (viewerInstance.current) {
      viewerInstance.current.viewport.fitVertically()
      viewerInstance.current.viewport.applyConstraints()
    }
  }

  // Navigation functions
  const goToPrevious = () => {
    if (mediaData.length === 0) return
    const newIndex = currentIndex > 0 ? currentIndex - 1 : mediaData.length - 1
    const newIdentifier = mediaData[newIndex]?.identifier
    if (newIdentifier && onNavigate) {
      onNavigate(newIdentifier)
    }
  }

  const goToNext = () => {
    if (mediaData.length === 0) return
    const newIndex = currentIndex < mediaData.length - 1 ? currentIndex + 1 : 0
    const newIdentifier = mediaData[newIndex]?.identifier
    if (newIdentifier && onNavigate) {
      onNavigate(newIdentifier)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, mediaData.length, onClose, onNavigate])

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div className="bg-opacity-95 fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Overlay */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Main container */}
      <div className="relative mx-auto my-auto flex h-full max-h-[100dvh] w-full max-w-[100vw] flex-col overflow-hidden rounded-lg bg-black">
        {/* Header */}
        <div className="relative z-20 flex-shrink-0 bg-black/80 px-4 py-3">
          <div className="flex items-center justify-between text-white">
            <h3 className="truncate">
              Image {currentIndex + 1} of {mediaData.length} ({mediaData[currentIndex]?.imageRole})
            </h3>

            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-full p-2 hover:cursor-pointer transition-colors hover:bg-white/20"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* OpenSeaDragon Viewer Container */}
        <div className="relative flex-1 overflow-hidden">
          <div ref={viewerRef} className="absolute inset-0" />

          {/* Custom zoom controls */}
          <div className="absolute top-4 left-4 z-20 p-0 flex items-center space-x-1 rounded-lg border border-border/10 bg-zinc-900 shadow-lg">
            <button
              id="zoom-out-btn"
              onClick={handleZoomOut}
              className="cursor-pointer rounded p-2 text-white transition-colors hover:bg-zinc-800"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>

            <span className="min-w-[3rem] px-1 text-center text-sm font-medium text-white">{zoomPercentage}%</span>

            <button
              id="zoom-in-btn"
              onClick={handleZoomIn}
              className="cursor-pointer rounded p-2 text-white transition-colors hover:bg-zinc-800"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn className="h-5 w-5" />
            </button>

            <div className="mx-1 h-6 w-px bg-zinc-700" />

            <button
              id="home-btn"
              onClick={handleResetView}
              className="cursor-pointer rounded p-2 text-white transition-colors hover:bg-zinc-800"
              aria-label="Reset zoom"
              title="Reset zoom"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation arrows */}
          {mediaData.length > 1 && (
            <div className="absolute top-4 right-4 z-20 p-0 flex items-center space-x-1 rounded-lg border border-border/10 bg-zinc-900 shadow-lg">
              <button
                onClick={goToPrevious}
                className="cursor-pointer rounded p-2 text-white transition-colors hover:bg-zinc-800"
                aria-label="Previous image"
                title="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                onClick={goToNext}
                className="cursor-pointer rounded p-2 text-white transition-colors hover:bg-zinc-800"
                aria-label="Next image"
                title="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer with image counter */}
        <div className="relative z-20 flex-shrink-0 bg-black/80 px-4 py-3">
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {mediaData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const identifier = mediaData[index]?.identifier
                    if (identifier && onNavigate) {
                      onNavigate(identifier)
                    }
                  }}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    mediaData.length === 1
                      ? index === currentIndex
                        ? 'cursor-default bg-white/30'
                        : 'cursor-default bg-white/10'
                      : index === currentIndex
                        ? 'cursor-pointer bg-white'
                        : 'cursor-pointer bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                  disabled={mediaData.length === 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
