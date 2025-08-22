import React, { useContext, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { RotateCcw, X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Viewer, ViewerContext, ViewerProvider } from 'react-viewer-pan-zoom'
import { Button } from '@/components/ui/button'

// --- Type Definition ---
type MultimediaData = {
  type: string
  identifier: string
  imageRole: string
  thumbnailUrl: string
  imageUrl: string
}

// --- Generic Image Lightbox Component ---
interface ImageLightboxProps {
  mediaData: MultimediaData[]
  currentIdentifier: string
  isOpen: boolean
  onClose: () => void
  onNavigate?: (identifier: string) => void
}

/**
 * A generic and reusable lightbox component for displaying and interacting with images.
 * Supports navigation between multiple images in a gallery.
 * Uses react-viewer-pan-zoom for advanced pan and zoom functionality.
 * Renders into a portal to avoid z-index issues.
 *
 * @param mediaData Array of multimedia data objects.
 * @param currentIdentifier The identifier of the currently displayed image.
 * @param isOpen Controls the visibility of the lightbox.
 * @param onClose A callback function to close the lightbox.
 * @param onNavigate Optional callback function called when navigating between images.
 */
export function ImageLightbox({ 
  mediaData, 
  currentIdentifier, 
  isOpen, 
  onClose, 
  onNavigate 
}: ImageLightboxProps) {
  const [isLoading, setIsLoading] = useState(true)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Find current image and its index
  const currentIndex = mediaData.findIndex(item => item.identifier === currentIdentifier)
  const currentImage = mediaData[currentIndex]
  const hasMultipleImages = mediaData.length > 1
  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < mediaData.length - 1

  // Navigation functions
  const goToPrevious = () => {
    if (canGoPrevious) {
      const previousImage = mediaData[currentIndex - 1]
      onNavigate?.(previousImage.identifier)
    }
  }

  const goToNext = () => {
    if (canGoNext) {
      const nextImage = mediaData[currentIndex + 1]
      onNavigate?.(nextImage.identifier)
    }
  }

  // Effect to handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowLeft' && canGoPrevious) {
        goToPrevious()
      } else if (event.key === 'ArrowRight' && canGoNext) {
        goToNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, canGoPrevious, canGoNext, currentIndex])

  // Effect to manage body scroll when the lightbox is opened or closed
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      document.body.style.overflow = 'hidden'
      // Focus the close button when the lightbox opens
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  // Reset loading state when image changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
    }
  }, [currentIdentifier])

  // Don't render anything if the lightbox is not open or no current image
  if (!isOpen || !currentImage) return null

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the viewer content
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleDownload = async () => {
    try {
      // Try the fetch method first (works for same-origin or CORS-enabled images)
      const response = await fetch(currentImage.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = currentImage.imageRole || currentImage.identifier || 'image'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.warn('Fetch download failed, falling back to direct link method:', error)

      // Fallback: Direct link download (works for most cases but may open in new tab)
      const a = document.createElement('a')
      a.href = currentImage.imageUrl
      a.download = currentImage.imageRole || currentImage.identifier || 'image'
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const contentStyle: React.CSSProperties = {
    willChange: 'transform',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
    maxWidth: '95vw',
    maxHeight: '100dvh',
  }

  const content = (
    <img
      style={contentStyle}
      draggable="false"
      src={currentImage.imageUrl}
      alt={currentImage.imageRole}
      onLoad={handleImageLoad}
      className={isLoading ? 'opacity-0' : 'transition-opacity opacity-100 will-change-transform'}
    />
  )

  // --- Render into a Portal ---
  return ReactDOM.createPortal(
    <div className="bg-opacity-80 fixed inset-0 z-[999999] bg-black backdrop-blur-sm" onClick={handleBackdropClick}>
      <style>{`
        ._viewer-minimap_1mddk_19 {
          position: absolute !important;
          bottom: 16px !important;
          right: 16px !important;
          top: auto !important;
          left: auto !important;
          border-radius: 6px !important;
        }
      `}</style>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        </div>
      )}
      
      {/* Navigation Arrows */}
      {hasMultipleImages && (
        <>
          {canGoPrevious && (
            <Button
              onClick={goToPrevious}
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 size-12 z-10"
              aria-label="Previous Image"
            >
              <ChevronLeft size={24} />
            </Button>
          )}
          {canGoNext && (
            <Button
              onClick={goToNext}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 size-12 z-10"
              aria-label="Next Image"
            >
              <ChevronRight size={24} />
            </Button>
          )}
        </>
      )}

      <ViewerProvider
        key={currentIdentifier} // Force re-render when image changes
        settings={{
          zoom: {
            enabled: true,
            default: 1, // Default zoom level when the viewer is opened.
            min: 1,
            max: 8,
            mouseWheelStep: 2, // How much zoom per mouse wheel step.
            zoomButtonStep: 1,
          },
          resetView: {
            enabled: true,
            keyboardShortcut: 'r', // The keyboard shortcut to reset the view (set to `false` to disable).
          },
          minimap: {
            enabled: true,
            width: '160px', // Width of the minimap.
            keyboardShortcut: 'm', // The keyboard shortcut to toggle the minimap (set to `false` to disable).
            outlineStyle: '1px solid black', // Outline style for the minimap.
            viewportAreaOutlineStyle: '2px solid #333', // Outline style for the viewport
          },
        }}
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex h-full w-full items-center justify-center">
            <Viewer viewportContent={content} minimapContent={content} />
          </div>
          <LightboxToolbar 
            onClose={onClose} 
            closeButtonRef={closeButtonRef} 
            onDownload={handleDownload}
            currentIndex={currentIndex}
            totalImages={mediaData.length}
            imageRole={currentImage.imageRole}
          />
        </div>
      </ViewerProvider>
    </div>,
    document.body,
  )
}

const LightboxToolbar = ({
  onClose,
  closeButtonRef,
  onDownload,
  currentIndex,
  totalImages,
  imageRole,
}: {
  onClose: () => void
  closeButtonRef: React.RefObject<HTMLButtonElement | null>
  onDownload: () => void
  currentIndex: number
  totalImages: number
  imageRole: string
}) => {
  const { zoomOut, zoomIn, resetView, crop } = useContext(ViewerContext)

  const handleToolbarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <>
      {/* Image Info */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 text-white" onClick={handleToolbarClick}>
        {totalImages > 1 && (
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-md text-sm">
            {currentIndex + 1} / {totalImages}
          </div>
        )}
        {imageRole && (
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-md text-sm max-w-xs truncate">
            {imageRole}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-3 text-white" onClick={handleToolbarClick}>
        <div className="bg-background border-input flex h-8 items-center gap-1 rounded-md border">
          <Button
            onClick={zoomOut}
            variant="ghost"
            size="icon"
            className="bg-background text-primary hover:bg-accent size-8 border-0"
            aria-label="Zoom Out"
          >
            <ZoomOut size={16} />
          </Button>
          <span className="bg-background text-primary hover:bg-accent min-w-[3rem] text-center text-sm">
            {(crop.zoom * 100).toFixed(0)}%
          </span>
          <Button
            onClick={zoomIn}
            variant="ghost"
            size="icon"
            className="bg-background text-primary hover:bg-accent size-8 border-0"
            aria-label="Zoom In"
          >
            <ZoomIn size={16} />
          </Button>
        </div>
        <Button
          onClick={resetView}
          variant="ghost"
          size="icon"
          className="bg-background text-primary hover:bg-accent border-input size-8 border"
          aria-label="Reset View"
        >
          <RotateCcw size={18} />
        </Button>
        <Button
          onClick={onDownload}
          variant="ghost"
          size="icon"
          className="bg-background text-primary hover:bg-accent border-input size-8 border"
          aria-label="Download Image"
        >
          <Download size={18} />
        </Button>
        <Button
          ref={closeButtonRef}
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="bg-background text-primary hover:bg-accent border-input size-8 border"
          aria-label="Close Lightbox"
        >
          <X size={18} />
        </Button>
      </div>
    </>
  )
}