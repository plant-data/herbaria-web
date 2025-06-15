import React, { useContext, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'
import { Viewer, ViewerContext, ViewerProvider } from 'react-viewer-pan-zoom'
import { Button } from '@/components/ui/button'

// --- Generic Image Lightbox Component ---
interface ImageLightboxProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

/**
 * A generic and reusable lightbox component for displaying and interacting with images.
 * Uses react-viewer-pan-zoom for advanced pan and zoom functionality.
 * Renders into a portal to avoid z-index issues.
 *
 * @param src The source URL for the high-resolution image.
 * @param alt The alternative text for the image.
 * @param isOpen Controls the visibility of the lightbox.
 * @param onClose A callback function to close the lightbox.
 */
export function ImageLightbox({
  src,
  alt,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [isLoading, setIsLoading] = useState(true)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Effect to handle Escape key press for closing the lightbox
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

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

  // Don't render anything if the lightbox is not open
  if (!isOpen) return null

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the viewer content
    if (e.target === e.currentTarget) {
      onClose()
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
      src={src}
      alt={alt}
      onLoad={handleImageLoad}
      className={
        isLoading
          ? 'opacity-0'
          : 'opacity-100 transition-opacity, will-change-transform'
      }
    />
  )

  // --- Render into a Portal ---
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[999999] bg-black bg-opacity-80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
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
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <ViewerProvider
        settings={{
          zoom: {
            enabled: true,
            default: 1, // Default zoom level when the viewer is opened.
            min: 1,
            max: 10,
            mouseWheelStep: 0.5, // How much zoom per mouse wheel step.
            zoomButtonStep: 2,
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
        <div className="w-full h-full flex flex-col">
          <div className="w-full h-full flex items-center justify-center">
            <Viewer viewportContent={content} minimapContent={content} />
          </div>

          <LightboxToolbar onClose={onClose} closeButtonRef={closeButtonRef} />
        </div>
      </ViewerProvider>
    </div>,
    document.body,
  )
}

const LightboxToolbar = ({
  onClose,
  closeButtonRef,
}: {
  onClose: () => void
  closeButtonRef: React.RefObject<HTMLButtonElement | null>
}) => {
  const { zoomOut, zoomIn, resetView, crop } = useContext(ViewerContext)

  const handleToolbarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="absolute top-4 right-4 flex items-center gap-3 text-white"
      onClick={handleToolbarClick}
    >
      <div className="flex items-center gap-1 h-8 bg-background rounded-md border border-input">
        <Button
          onClick={zoomOut}
          variant="ghost"
          size="icon"
          className="size-8 bg-background text-primary hover:bg-accent border-0 "
          aria-label="Zoom Out"
        >
          <ZoomOut size={16} />
        </Button>
        <span className="text-sm min-w-[3rem] text-center bg-background text-primary hover:bg-accent">
          {(crop.zoom * 100).toFixed(0)}%
        </span>
        <Button
          onClick={zoomIn}
          variant="ghost"
          size="icon"
          className="size-8 bg-background text-primary hover:bg-accent border-0"
          aria-label="Zoom In"
        >
          <ZoomIn size={16} />
        </Button>
      </div>

      <Button
        onClick={resetView}
        variant="ghost"
        size="icon"
        className="size-8 bg-background text-primary hover:bg-accent border border-input"
        aria-label="Reset View"
      >
        <RotateCcw size={18} />
      </Button>
      <Button
        ref={closeButtonRef}
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="size-8 bg-background text-primary hover:bg-accent border border-input"
        aria-label="Close Lightbox"
      >
        <X size={18} />
      </Button>
    </div>
  )
}
