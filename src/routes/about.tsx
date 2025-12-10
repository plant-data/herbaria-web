import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      {
        title: 'About - Herbaria',
      },
      {
        name: 'description',
        content: 'Learn about the FlorItaly Herbaria project and how to use the search and exploration tools.',
      },
    ],
  }),
})
