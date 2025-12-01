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
  head: () => ({
    meta: [
      {
        title: 'Herbaria - Digital Herbarium Collections Portal',
      },
      {
        name: 'description',
        content:
          'Explore digital herbarium collections from multiple institutions. Access botanical specimens, research data, and scientific resources.',
      },
      {
        property: 'og:title',
        content: 'Herbaria - Digital Herbarium Collections Portal',
      },
      {
        property: 'og:description',
        content:
          'Explore digital herbarium collections from multiple institutions. Access botanical specimens, research data, and scientific resources.',
      },
    ],
  }),
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
      <div className="relative aspect-16/11">
        <img src={herbarium.image} alt={t(herbarium.translationKey)} className="h-full w-full object-cover" />
        <Badge className="border-border/60 bg-background/80 text-primary/80 absolute top-4 left-4 border text-xs font-semibold uppercase">
          {herbarium.badgeLabel}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="space-y-3 text-left">
          <CardTitle className="text-foreground text-xl font-semibold">{t(herbarium.translationKey)}</CardTitle>
          <p className="text-foreground/70 text-sm">{t(herbarium.description as any)}</p>
        </div>
      </div>
      <div className="mx-2 mb-6 grid gap-2 sm:grid-cols-2">
        <Link
          onClick={onNavigate}
          to="/$herbariaId"
          params={{ herbariaId: herbarium.id }}
          className="border-border/70 text-foreground hover:bg-accent focus-visible:ring/50 focus-visible:ring-[2px]-ring focus-visible:ring-ring/50 inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-medium shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <Home className="h-4 w-4" />
          {t('herbaria-homepage.home-button')}
        </Link>
        <Link
          onClick={onNavigate}
          to="/$herbariaId/images"
          params={{ herbariaId: herbarium.id }}
          className="bg-foreground text-background hover:bg-primary/90 focus-visible:ring/50 focus-visible:ring-[2px]-ring focus-visible:ring-ring/50 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
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

  const handleNavigate = () => {
    resetFilters()
    resetMap()
  }

  return (
    <>
      <div className="bg-background relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_55%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.12),transparent_45%)]" />
        <div className="container mx-auto flex flex-col gap-16 px-4 pt-12 pb-24 md:gap-24">
          <section className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* left images */}
            <div className="hidden flex-col gap-8 lg:col-span-3 lg:flex">
              <div className="bg-background/50 relative aspect-3/4 w-full max-w-[220px] -rotate-6 overflow-hidden rounded-2xl border p-2 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 hover:rotate-0">
                <img
                  src="https://object.jacq.org/europeana/PI/2204769.jpg"
                  alt="Herbarium Specimen"
                  className="h-full w-full rounded-xl object-cover"
                />
              </div>
              <div className="bg-background/50 relative ml-12 aspect-3/4 w-full max-w-[220px] rotate-3 overflow-hidden rounded-2xl border p-2 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 hover:rotate-0">
                <img
                  src="https://object.jacq.org/europeana/PI/2204769.jpg"
                  alt="Herbarium Specimen"
                  className="h-full w-full rounded-xl object-cover"
                />
              </div>
            </div>

            {/* center */}
            <div className="flex flex-col items-center gap-8 text-center lg:col-span-6">
              <div className="space-y-6">
                <h1 className="text-foreground text-5xl font-medium tracking-tight text-balance sm:text-5xl md:text-6xl">
                  {t('herbaria-homepage.title')}
                </h1>
                <p className="text-foreground/70 mx-auto max-w-[600px] text-lg leading-relaxed md:text-xl">
                  {t('herbaria-homepage.description')}
                </p>
                <p className="text-foreground/70 text-sm font-medium">{t('herbaria-homepage.sub-description')}</p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  to="/"
                  hash="collections"
                  preload={false}
                  className="border-border/70 text-foreground hover:bg-accent focus-visible:ring/50 focus-visible:ring-[2px]-ring focus-visible:ring-ring/50 inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-medium shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <ArrowRight className="h-5 w-5" />
                  {t('herbaria-homepage.browse-herbaria-button')}
                </Link>
                <Link
                  to="/$herbariaId/images"
                  params={{ herbariaId: 'all' }}
                  onClick={handleNavigate}
                  className="bg-foreground text-background hover:bg-primary/90 focus-visible:ring/50 focus-visible:ring-[2px]-ring focus-visible:ring-ring/50 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <Search className="h-5 w-5" />
                  {t('herbaria-homepage.explore-button')}
                </Link>
              </div>

              {/* mobile images */}
              <div className="relative mt-8 flex h-[220px] w-full items-center justify-center sm:h-[280px] lg:hidden">
                <div className="absolute top-1/2 left-1/2 w-32 -translate-x-[125%] -translate-y-1/2 -rotate-12 transform transition-transform hover:z-10 hover:scale-110 sm:w-40">
                  <div className="bg-background overflow-hidden rounded-xl border p-1 shadow-xl lg:p-2">
                    <img
                      src="https://object.jacq.org/europeana/PI/2204769.jpg"
                      alt="Herbarium Specimen"
                      className="aspect-3/4 w-full rounded-lg object-cover"
                    />
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 w-32 -translate-x-[75%] -translate-y-1/2 -rotate-6 transform transition-transform hover:z-10 hover:scale-110 sm:w-40">
                  <div className="bg-background overflow-hidden rounded-xl border p-1 shadow-xl lg:p-2">
                    <img
                      src="https://object.jacq.org/europeana/PI/2204769.jpg"
                      alt="Herbarium Specimen"
                      className="aspect-3/4 w-full rounded-lg object-cover"
                    />
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 w-32 -translate-x-[25%] -translate-y-1/2 rotate-6 transform transition-transform hover:z-10 hover:scale-110 sm:w-40">
                  <div className="bg-background overflow-hidden rounded-xl border p-1 shadow-xl lg:p-2">
                    <img
                      src="https://object.jacq.org/europeana/PI/2204769.jpg"
                      alt="Herbarium Specimen"
                      className="aspect-3/4 w-full rounded-lg object-cover"
                    />
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 w-32 translate-x-[25%] -translate-y-1/2 rotate-12 transform transition-transform hover:z-10 hover:scale-110 sm:w-40">
                  <div className="bg-background overflow-hidden rounded-xl border p-1 shadow-xl lg:p-2">
                    <img
                      src="https://object.jacq.org/europeana/PI/2204769.jpg"
                      alt="Herbarium Specimen"
                      className="aspect-3/4 w-full rounded-lg object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* right images */}
            <div className="hidden flex-col gap-8 lg:col-span-3 lg:flex">
              <div className="bg-background/50 relative mt-12 aspect-3/4 w-full max-w-[220px] rotate-6 overflow-hidden rounded-2xl border p-2 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 hover:rotate-0">
                <img
                  src="https://object.jacq.org/europeana/PI/2204769.jpg"
                  alt="Herbarium Specimen"
                  className="h-full w-full rounded-xl object-cover"
                />
              </div>
              <div className="bg-background/50 relative -ml-8 aspect-3/4 w-full max-w-[220px] -rotate-4 overflow-hidden rounded-2xl border p-2 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 hover:rotate-0">
                <img
                  src="https://object.jacq.org/europeana/PI/2204769.jpg"
                  alt="Herbarium Specimen"
                  className="h-full w-full rounded-xl object-cover"
                />
              </div>
            </div>
          </section>

          <section id="collections" className="mx-auto flex max-w-6xl flex-col gap-10">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
                {t('herbaria-homepage.herbaria-section-title')}
              </h2>
              <p className="text-foreground/70 mt-3 text-base">{t('herbaria-homepage.herbaria-section-description')}</p>
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
