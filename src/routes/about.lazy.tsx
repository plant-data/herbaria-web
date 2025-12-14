import { createLazyFileRoute } from '@tanstack/react-router'
import { Footer } from '@/components/footer'

export const Route = createLazyFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <>
      In preparazione...
    </>
  )
}
