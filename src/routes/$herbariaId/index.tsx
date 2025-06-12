import { Link, createFileRoute  } from '@tanstack/react-router'

export const Route = createFileRoute('/$herbariaId/')({
  loader: async ({ params }) => {
    console.log(params['herbariaId'])
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { herbariaId } = Route.useParams()
  return <div>{herbariaId}<Link to='/$herbariaId/search' params={{ herbariaId }}>Search</Link></div>
}
