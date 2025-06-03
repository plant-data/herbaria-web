import { createFileRoute } from '@tanstack/react-router'
import SpecimensGallery from '@/features/search/components/specimens-gallery'

export const Route = createFileRoute('/search/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SpecimensGallery />
}