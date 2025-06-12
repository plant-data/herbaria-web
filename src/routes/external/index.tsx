import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/external/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/external/"!</div>
}
