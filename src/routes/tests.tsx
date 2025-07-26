import { createFileRoute } from '@tanstack/react-router'
import {AreaMapFilter} from '@/features/search/components/area-map-filter'

export const Route = createFileRoute('/tests')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AreaMapFilter/>
}
