import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/$herbariaId/(search)/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/$herbariaId/images',
      params: { herbariaId: params.herbariaId },
    })
  },
})
