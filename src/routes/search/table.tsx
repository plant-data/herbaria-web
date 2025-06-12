import { createFileRoute } from '@tanstack/react-router'
import { SpecimensTable } from '@/features/search/components/specimens-table'

export const Route = createFileRoute('/search/table')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <SpecimensTable />
    </div>
  )
}
