import { SpecimensGraphs } from '@/features/search/components/specimens-graphs'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/search/graphs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div><SpecimensGraphs/></div>
}
