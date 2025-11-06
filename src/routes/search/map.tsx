import { createFileRoute } from '@tanstack/react-router'
import { SpecimensMap } from '@/features/search/components/specimens-map'

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
