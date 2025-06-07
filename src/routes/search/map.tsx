import { SpecimensMap } from '@/features/search/components/specimens-map'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/search/map')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <SpecimensMap />
    </div>
  )
}
