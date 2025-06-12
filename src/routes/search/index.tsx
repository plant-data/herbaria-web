import { createFileRoute, ErrorComponent } from '@tanstack/react-router'
import SpecimensGallery from '@/features/search/components/specimens-gallery'

export const Route = createFileRoute('/search/')({
  component: RouteComponent,
  errorComponent: ErrorComponent,
})

function RouteComponent() {
  return <SpecimensGallery />
}
