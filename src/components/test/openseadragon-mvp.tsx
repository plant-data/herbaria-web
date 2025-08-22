import { useEffect, useRef } from 'react'
import OpenSeadragon from 'openseadragon'

export function OpenSeaDragonMVP({ imgUrl }: { imgUrl: string }) {
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null)

  useEffect(() => {
    const viewer = OpenSeadragon({
      id: 'seadragon-viewer',
      tileSources: {
        type: 'image',
        url: imgUrl,
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
      maxZoomLevel: 10,
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
      navigationControlAnchor: OpenSeadragon.ControlAnchor.TOP_LEFT,
      sequenceMode: false,
    })
    viewerRef.current = viewer

    return () => {
      viewerRef.current?.destroy()
    }
  }, [imgUrl])

  return <div id="seadragon-viewer" className="seadragon-viewer h-[500px] w-[300px]" />
}
