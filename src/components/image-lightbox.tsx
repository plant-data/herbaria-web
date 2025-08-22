
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import OpenSeaDragon from 'openseadragon';

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
        navigatorPosition: 'TOP_RIGHT',
        navigatorSizeRatio: 0.15,
        navigatorMaintainSizeRatio: true,
        navigatorBackground: '#000',
        navigatorOpacity: 0.8,
        navigatorBorderColor: '#555',
        navigatorDisplayRegionColor: '#900',
        maxZoomLevel: 8,
        minZoomLevel: 0.5,
        defaultZoomLevel: 1,
        zoomInButton: 'zoom-in-btn',
        zoomOutButton: 'zoom-out-btn',
        homeButton: 'home-btn',
        fullPageButton: 'fullpage-btn',
        showZoomControl: true,
        showHomeControl: true,
        showFullPageControl: false,
        showSequenceControl: false,
        animationTime: 1.0,
        springStiffness: 6.5,
        imageLoaderLimit: 2,
        timeout: 120000,
        useCanvas: true,
        preserveImageSizeOnResize: true,
        visibilityRatio: 1,
        constrainDuringPan: false,
        wrapHorizontal: false,
        wrapVertical: false,
        panHorizontal: true,
        panVertical: true,
        showNavigationControl: true,
        navigationControlAnchor: OpenSeaDragon.ControlAnchor.TOP_LEFT,
        sequenceMode: false
      });

      // Add custom styling to navigator
      viewerInstance.current.addHandler('open', () => {
        const navigator = viewerInstance.current?.navigator?.element;
        if (navigator) {
          navigator.style.border = '2px solid #555';
          navigator.style.borderRadius = '4px';
          navigator.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        }
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
      <div className="relative w-full h-full max-w-7xl max-h-full mx-4 my-4 bg-black rounded-lg overflow-hidden">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* OpenSeaDragon Viewer */}
        <div 
          ref={viewerRef}
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />

        {/* Custom zoom controls */}
        <div className="absolute top-20 left-4 z-20 flex flex-col space-y-2">
          <button
            id="zoom-in-btn"
            className="p-2 bg-black/70 hover:bg-black/90 text-white rounded transition-colors"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          
          <button
            id="zoom-out-btn"
            className="p-2 bg-black/70 hover:bg-black/90 text-white rounded transition-colors"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <button
            id="home-btn"
            className="p-2 bg-black/70 hover:bg-black/90 text-white rounded transition-colors"
            aria-label="Reset zoom"
            title="Reset zoom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
          </button>
        </div>

        {/* Navigation arrows */}
        {hasPrevious && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {hasNext && (
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Footer with image counter */}
        {mediaData.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4">
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
