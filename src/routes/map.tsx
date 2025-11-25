import { createFileRoute } from '@tanstack/react-router'

import type { LatLngExpression } from 'leaflet'
import {
  Map,
  MapDrawCircle,
  MapDrawControl,
  MapDrawDelete,
  MapDrawEdit,
  MapDrawMarker,
  MapDrawPolygon,
  MapDrawPolyline,
  MapDrawRectangle,
  MapDrawUndo,
  MapTileLayer,
  MapZoomControl,
} from '@/components/ui/map'

export const Route = createFileRoute('/map')({
  component: RouteComponent,
})

function RouteComponent() {
  const TORONTO_COORDINATES = [43.6532, -79.3832] satisfies LatLngExpression

  return (
    <Map center={TORONTO_COORDINATES}>
      <MapTileLayer />
      <MapZoomControl />
      <MapDrawControl>
        <MapDrawMarker />
        <MapDrawPolyline />
        <MapDrawCircle />
        <MapDrawRectangle />
        <MapDrawPolygon />
        <MapDrawEdit />
        <MapDrawDelete />
        <MapDrawUndo />
      </MapDrawControl>
    </Map>
  )
}
