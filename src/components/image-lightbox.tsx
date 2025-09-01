import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import OpenSeaDragon from 'openseadragon';
import { ZoomIn, ZoomOut, RotateCcw, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MultimediaData {
  imageUrl: string;
  identifier: string;
  [key: string]: any;
}

interface ImageLightboxProps {
  mediaData: MultimediaData[];
  currentIdentifier: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (identifier: string) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  mediaData,
  currentIdentifier,
  isOpen,
  onClose,
  onNavigate
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<OpenSeaDragon.Viewer | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomPercentage, setZoomPercentage] = useState(100);

  // Find current index based on identifier
  useEffect(() => {
    const index = mediaData.findIndex(item => item.identifier === currentIdentifier);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [currentIdentifier, mediaData]);

  // Initialize OpenSeaDragon viewer
  useEffect(() => {
    if (!isOpen || !viewerRef.current || !mediaData.length) return;

    const currentItem = mediaData[currentIndex];
    if (!currentItem) return;

    // Destroy existing viewer
    if (viewerInstance.current) {
      viewerInstance.current.destroy();
      viewerInstance.current = null;
    }

    try {
      viewerInstance.current = OpenSeaDragon({
        element: viewerRef.current,
        tileSources: {
          type: 'image',
          url: currentItem.imageUrl
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

      });

      // Add custom styling to navigator
      viewerInstance.current.addHandler('open', () => {
        const navigator = viewerInstance.current?.navigator?.element;
        if (navigator) {
          navigator.style.border = '2px solid #555';
          navigator.style.borderRadius = '4px';
          navigator.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        }

        // Ensure the image fits height on open
        /* if (viewerInstance.current) {
          const viewport = viewerInstance.current.viewport;
          viewport.fitVertically();
          viewport.applyConstraints();
        } */
      });

      // Update zoom percentage when zoom changes
      viewerInstance.current.addHandler('zoom', () => {
        if (!viewerInstance.current) return;
        const zoom = viewerInstance.current.viewport.getZoom();
        const homeZoom = viewerInstance.current.viewport.getHomeZoom();
        const percentage = Math.round((zoom / homeZoom) * 100);
        setZoomPercentage(percentage);
      });

    } catch (error) {
      console.error('Failed to initialize OpenSeaDragon:', error);
    }

    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.destroy();
        viewerInstance.current = null;
      }
    };
  }, [isOpen, currentIndex, mediaData]);

  // Zoom control functions
  const handleZoomIn = () => {
    if (viewerInstance.current) {
      viewerInstance.current.viewport.zoomBy(1.5);
    }
  };

  const handleZoomOut = () => {
    if (viewerInstance.current) {
      viewerInstance.current.viewport.zoomBy(0.67);
    }
  };

  const handleResetView = () => {
    if (viewerInstance.current) {
      viewerInstance.current.viewport.fitVertically();
      viewerInstance.current.viewport.applyConstraints();
    }
  };

  // Navigation functions
  const goToPrevious = () => {
    if (mediaData.length === 0) return;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : mediaData.length - 1;
    const newIdentifier = mediaData[newIndex]?.identifier;
    if (newIdentifier && onNavigate) {
      onNavigate(newIdentifier);
    }
  };

  const goToNext = () => {
    if (mediaData.length === 0) return;
    const newIndex = currentIndex < mediaData.length - 1 ? currentIndex + 1 : 0;
    const newIdentifier = mediaData[newIndex]?.identifier;
    if (newIdentifier && onNavigate) {
      onNavigate(newIdentifier);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, mediaData.length, onClose, onNavigate]);

  if (!isOpen) return null;

  const currentItem = mediaData[currentIndex];
  const hasPrevious = mediaData.length > 1;
  const hasNext = mediaData.length > 1;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />
      
      {/* Main container */}
      <div className="relative w-full h-full max-w-[90vw] max-h-[100dvh] mx-auto my-auto bg-black rounded-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="relative z-20 bg-black/80 px-4 py-3 flex-shrink-0">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold truncate">
                Image {currentIndex + 1} of {mediaData.length}
              </h3>
              {currentItem?.identifier && (
                <span className="text-sm text-gray-300">
                  ID: {currentItem.identifier}
                </span>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* OpenSeaDragon Viewer Container */}
        <div className="relative flex-1 overflow-hidden">
          <div 
            ref={viewerRef}
            className="absolute inset-0"
          />

          {/* Custom zoom controls */}
          <div className="absolute top-4 left-4 z-20 bg-black/70 rounded-lg p-1 flex items-center space-x-1">
            <button
              id="zoom-out-btn"
              onClick={handleZoomOut}
              className="p-2 hover:bg-white/20 text-white rounded transition-colors"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <span className="min-w-[3rem] text-center text-sm font-medium text-white px-1">
              {zoomPercentage}%
            </span>
            
            <button
              id="zoom-in-btn"
              onClick={handleZoomIn}
              className="p-2 hover:bg-white/20 text-white rounded transition-colors"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            
            <div className="w-px h-6 bg-white/30 mx-1" />
            
            <button
              id="home-btn"
              onClick={handleResetView}
              className="p-2 hover:bg-white/20 text-white rounded transition-colors"
              aria-label="Reset zoom"
              title="Reset zoom"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation arrows */}
          {hasPrevious && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {hasNext && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Footer with image counter */}
        {mediaData.length > 1 && (
          <div className="relative z-20 bg-black/80 px-4 py-3 flex-shrink-0">
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {mediaData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const identifier = mediaData[index]?.identifier;
                      if (identifier && onNavigate) {
                        onNavigate(identifier);
                      }
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex 
                        ? 'bg-white' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};