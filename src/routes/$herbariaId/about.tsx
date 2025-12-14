import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$herbariaId/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>In sviluppo</div>
}
