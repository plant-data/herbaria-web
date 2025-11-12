import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Home, Search } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { HERBARIA_CONFIG } from '@/features/search/constants/herbaria'
import { Footer } from '@/components/footer'

const HERBARIA_WITH_GLOBAL = HERBARIA_CONFIG

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
    <Card className="group border-border/60 bg-background/80 hover:border-border relative flex h-full max-w-[400px] flex-col justify-between overflow-hidden border py-0 shadow-xs">
      <div className="relative aspect-[16/11]">
        <img src={herbarium.image} alt={t(herbarium.translationKey)} className="h-full w-full object-cover" />
        <Badge className="border-border/60 bg-background/80 text-primary/80 absolute top-4 left-4 border text-xs font-semibold uppercase">
          {herbarium.badgeLabel}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="space-y-3 text-left">
          <CardTitle className="text-foreground text-xl font-semibold">{t(herbarium.translationKey)}</CardTitle>
          <p className="text-muted-foreground text-sm">{t(herbarium.description as any)}</p>
        </div>
      </div>
      <div className="mx-2 mb-6 grid gap-2 sm:grid-cols-2">
        <Link
          onClick={onNavigate}
          to="/$herbariaId"
          params={{ herbariaId: herbarium.id }}
          className="border-border/70 text-foreground hover:bg-accent focus-visible:ring/50 focus-visible:ring-[2px]-ring focus-visible:ring-ring/50 inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-medium shadow-xs transition-colors focus-visible:ring-[2px] focus-visible:outline-none"
        >
          <Home className="h-4 w-4" />
          {t('herbaria-homepage.home-button')}
        </Link>
        <Link
          onClick={onNavigate}
          to="/$herbariaId/search"
          params={{ herbariaId: herbarium.id }}
          className="bg-foreground text-background hover:bg-primary/90 focus-visible:ring/50 focus-visible:ring-[2px]-ring focus-visible:ring-ring/50 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-sm transition-colors focus-visible:ring-[2px] focus-visible:outline-none"
        >
          <Search className="h-4 w-4" />
          {t('herbaria-homepage.explore-button')}
        </Link>
      </div>
    </Card>
  )
}

function App() {
  const { t } = useTranslation()
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
                {t('herbaria-homepage.title')}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
                {t('herbaria-homepage.description')}
              </p>
              <p className="text-muted-foreground text-sm">{t('herbaria-homepage.sub-description')}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/search"
                onClick={handleNavigate}
                className="bg-foreground text-background focus-visible:ring/50 focus-visible:ring-[2px]-ring hover:bg-primary/90 focus-visible:ring-ring/50 inline-flex min-w-[200px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-sm focus-visible:ring-[2px] focus-visible:outline-none"
              >
                <Search className="h-4 w-4" />
                {t('herbaria-homepage.explore-button')}
              </Link>
              <a
                href="#collections"
                className="border-border/70 text-foreground hover:bg-accent focus-visible:ring/50 focus-visible:ring-[2px]-ring focus-visible:ring-ring/50 inline-flex min-w-[200px] items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-medium shadow-xs transition-colors focus-visible:ring-[2px] focus-visible:outline-none"
              >
                <ArrowRight className="h-4 w-4" />
                {t('herbaria-homepage.browse-herbaria-button')}
              </a>
            </div>
          </section>

          <section id="collections" className="mx-auto flex max-w-6xl flex-col gap-10">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
                {t('herbaria-homepage.herbaria-section-title')}
              </h2>
              <p className="text-muted-foreground mt-3 text-base">
                {t('herbaria-homepage.herbaria-section-description')}
              </p>
            </div>

            <div className="grid justify-items-center gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-2">
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
