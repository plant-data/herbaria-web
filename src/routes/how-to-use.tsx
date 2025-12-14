import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/how-to-use')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>In preparazione...</div>
}
