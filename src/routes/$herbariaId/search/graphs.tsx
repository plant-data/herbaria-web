import { createFileRoute } from '@tanstack/react-router'
import { SpecimensGraphs } from '@/features/search/components/specimens-graphs'

export const Route = createFileRoute('/$herbariaId/search/graphs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div><SpecimensGraphs/></div>
}
