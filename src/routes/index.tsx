import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Home, Search } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { HERBARIA_CONFIG } from '@/features/search/constants/herbaria'
import { Footer } from '@/components/footer'

// Configuration for herbaria including global search
const GLOBAL_SEARCH_CONFIG = {
  id: 'global',
  translationKey: 'herbaria.global',
  image: 'images/global-search.png',
  description:
    'Search across every collection simultaneously and surface specimens by taxonomy, geography, or dataset.',
  badgeLabel: 'All Herbaria',
  isGlobal: true,
} as const

const HERBARIA_WITH_GLOBAL = [GLOBAL_SEARCH_CONFIG, ...HERBARIA_CONFIG]

export const Route = createFileRoute('/')({
  component: App,
})

function HerbariumCard({
  herbarium,
  onNavigate,
}: {
  herbarium: (typeof HERBARIA_WITH_GLOBAL)[number]
  onNavigate: () => void
}) {
  const { t } = useTranslation()

  return (
    <Card className="group border-border/60 bg-background/80 hover:border-border relative flex h-full flex-col justify-between overflow-hidden border py-0 shadow-xs">
      <div className="relative aspect-[16/11]">
        <img src={herbarium.image} alt={t(herbarium.translationKey)} className="h-full w-full object-cover" />
        <Badge className="border-border/60 bg-background/80 text-primary/80 absolute top-4 left-4 border text-xs font-semibold  uppercase">
          {herbarium.badgeLabel}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="space-y-3 text-left">
          <CardTitle className="text-foreground text-xl font-semibold">{t(herbarium.translationKey)}</CardTitle>
          <p className="text-muted-foreground text-sm">{herbarium.description}</p>
        </div>
      </div>
      <div className="mx-2 mb-6 grid gap-2 sm:grid-cols-2">
        <Link
          onClick={onNavigate}
          to="/$herbariaId"
          params={{ herbariaId: herbarium.id }}
          className="border-border/70 text-foreground hover:border-foreground focus-visible:ring/50 focus-visible:ring-[2px]-ring inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-ring/50 focus-visible:ring-[2px] focus-visible:outline-none"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Link
          onClick={onNavigate}
          to="/$herbariaId/search"
          params={{ herbariaId: herbarium.id }}
          className="group bg-foreground text-background hover:bg-foreground/90 focus-visible:ring/50 focus-visible:ring-[2px]-ring inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-ring/50 focus-visible:ring-[2px] focus-visible:outline-none"
        >
          <Search className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          Explore
        </Link>
      </div>
    </Card>
  )
}

function App() {
  const resetFilters = useFilterStore((state) => state.resetFilters)
  const resetMap = useFilterStore((state) => state.resetMap)
  const totalHerbaria = HERBARIA_CONFIG.length

  const handleNavigate = () => {
    resetFilters()
    resetMap()
  }

  return (
    <>
      <div className="bg-background relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.12),_transparent_45%)]" />
        <div className="container mx-auto flex flex-col gap-24 px-4 pt-10 pb-24 md:pt-18">
          <section className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
            <div className="space-y-6">
              <h1 className="text-foreground text-4xl font-semibold tracking-tight text-balance md:text-6xl">
                FlorItaly Herbaria
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
                Discover digitised specimens and curated histories from Italy's leading herbaria.
              </p>
              <p className="text-muted-foreground text-sm">
                Currently showcasing <span className="text-foreground font-medium">{totalHerbaria}</span> curated
                collections with unified search.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/search"
                onClick={handleNavigate}
                className="bg-foreground text-background focus-visible:ring/50 focus-visible:ring-[2px]-ring inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-ring/50 focus-visible:ring-[2px] focus-visible:outline-none"
              >
                <Search className="h-4 w-4" />
                Explore Collections
              </Link>
              <a
                href="#collections"
                className="border-border/70 text-foreground hover:border-foreground hover:text-foreground focus-visible:ring/50 focus-visible:ring-[2px]-ring inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors focus-visible:ring-ring/50 focus-visible:ring-[2px] focus-visible:outline-none"
              >
                <ArrowRight className="h-4 w-4" />
                Browse Herbaria
              </a>
            </div>
          </section>

          <section id="collections" className="flex flex-col gap-10">
            <div className="max-w-3xl">
              <h2 className="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
                Collections at a glance
              </h2>
              <p className="text-muted-foreground mt-3 text-base">
                Jump straight to a partner herbarium or start with the global index to filter by location, taxonomy, or
                specimen metadata.
              </p>
            </div>

            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {HERBARIA_WITH_GLOBAL.map((herbarium) => (
                <HerbariumCard key={herbarium.id} herbarium={herbarium} onNavigate={handleNavigate} />
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}
