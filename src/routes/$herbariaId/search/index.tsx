import { ErrorComponent, createFileRoute } from '@tanstack/react-router'
import SpecimensGallery from '@/features/search/components/specimens-gallery'

export const Route = createFileRoute('/$herbariaId/search/')({
  component: RouteComponent,
  errorComponent: ErrorComponent,
})

function RouteComponent() {
  return <SpecimensGallery />
}