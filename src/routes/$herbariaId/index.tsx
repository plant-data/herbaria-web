import { Link, createFileRoute, notFound, redirect, useNavigate } from '@tanstack/react-router'
import { ChartSpline, Database, Earth, Layers, Leaf } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BASE_API_URL, BASE_IMAGE_URL } from '@/config'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { HERBARIA_CONFIG } from '@/features/search/constants/herbaria'
import { AutocompleteSimple } from '@/features/search/components/autocomplete-simple'
import { Footer } from '@/components/footer'
import { HerbariumNotFound } from '@/features/search/components/herbarium-not-found'

export const Route = createFileRoute('/$herbariaId/')({
  head: ({ params }) => {
    const herbarium = HERBARIA_CONFIG.find((h) => h.id.toLowerCase() === params.herbariaId.toLowerCase())
    const title = herbarium ? `${herbarium.id} - Herbaria` : 'Herbaria'
    const description = herbarium
      ? `Explore the ${herbarium.id} herbarium collection. Access botanical specimens, research data, and scientific resources.`
      : 'Digital Herbarium Collections Portal'

    return {
      meta: [
        {
          title,
        },
        {
          name: 'description',
          content: description,
        },
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: description,
        },
      ],
    }
  },
  loader: ({ params }) => {
    const { herbariaId } = params
    const herbariumExists = HERBARIA_CONFIG.some((herbarium) => herbarium.id.toLowerCase() === herbariaId.toLowerCase())

    // all does not have a dedicated homepage
    if (herbariaId === 'all') {
      throw redirect({ to: '/$herbariaId/images', params: { herbariaId } })
    }

    if (!herbariumExists) {
      throw notFound()
    }
  },
  component: RouteComponent,
  notFoundComponent: NotFoundComponent,
})

function NotFoundComponent() {
  const { herbariaId } = Route.useParams()
  return <HerbariumNotFound herbariaId={herbariaId} />
}

function RouteComponent() {
  const { t } = useTranslation()
  const { herbariaId } = Route.useParams()
  const navigate = useNavigate()
  const resetFilters = useFilterStore((state) => state.resetFilters)
  const resetMap = useFilterStore((state) => state.resetMap)
  const setScientificName = useFilterStore((state) => state.setScientificName)

  // find the current herbarium configuration
  const currentHerbarium = HERBARIA_CONFIG.find((herbarium) => herbarium.id === herbariaId.toUpperCase())
  // this should not happen due to the loader check
  // but typescript
  if (!currentHerbarium) {
    return null
  }

  // Use homeImages if available, otherwise fallback to default images
  const homeImages = currentHerbarium.homeImages || [
    `${BASE_IMAGE_URL}unsafe/704x1000//2024/05/06/CP2/CP2_20240506_BATCH_0001/JPG/FI-HCI-00204271.jpg`,
    `${BASE_IMAGE_URL}unsafe/704x1000//2024/05/06/CP2/CP2_20240506_BATCH_0001/JPG/FI-HCI-00206738.jpg`,
    `${BASE_IMAGE_URL}unsafe/704x1000//2024/05/06/CP2/CP2_20240506_BATCH_0001/JPG/FI-HCI-00207292.jpg`,
  ]

  const handleScientificNameSelected = (value: string) => {
    resetFilters()
    resetMap()
    setScientificName([value])
    navigate({
      to: '/$herbariaId/images',
      params: { herbariaId },
    })
  }

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="overflow-x-clip py-16 lg:py-24">
          <div className="mx-auto max-w-[90rem] px-4">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[550px_1fr] lg:grid-cols-[650px_1fr]">
              {/* Hero Text - Left Side (stays aligned with container) */}
              <div className="space-y-6 lg:pr-6 lg:pl-10">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-fit">
                    <Leaf className="mr-2 h-4 w-4" />
                    {/* Herbarium FI-HCI */}
                    {t(currentHerbarium.hero.badge)}
                  </Badge>
                  <h1 className="text-primary text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
                    <Trans
                      i18nKey={currentHerbarium.hero.title}
                      components={{
                        1: <span className="text-ring" />,
                      }}
                    />
                  </h1>
                </div>

                <p className="text-primary/80 max-w-lg">{t(currentHerbarium.hero.description)}</p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative min-w-[300px]">
                    <AutocompleteSimple
                      placeholder={t('search.filters.scientific-name-placeholder')}
                      queryKey={['simplesearch', herbariaId]}
                      query={
                        `${BASE_API_URL}specimens/suggestions?` +
                        (herbariaId ? `institutionCode=${herbariaId}&` : '') +
                        `field=scientificName&value=`
                      }
                      onSelectedValueChange={handleScientificNameSelected}
                    />
                  </div>
                  <Button
                    asChild
                    variant="default"
                    className="bg-ring hover:bg-ring/80 rounded-full"
                    size="lg"
                    onClick={() => {
                      resetFilters()
                      resetMap()
                    }}
                  >
                    <Link to="/$herbariaId/images" params={{ herbariaId }}>
                      <Database className="mr-2 h-5 w-5" />
                      {t('herbaria-pages.buttons.explore-collection')}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Images - Right Side (bleeds to viewport edge) */}
              <div className="md:-mr-[calc(50vw-50%+1rem)] md:pr-[calc(50vw-50%+1rem)]">
                <div className="flex w-full items-center justify-around gap-4 sm:justify-start">
                  <div className="mt-8">
                    <div className="aspect-[12/17] w-[28vw] overflow-hidden rounded-sm border sm:w-60 lg:w-64">
                      <img src={homeImages[0]} alt="Herbarium specimen" className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div className="-mt-4">
                    <div className="aspect-[12/17] w-[28vw] overflow-hidden rounded-sm border sm:w-60 lg:w-64">
                      <img src={homeImages[1]} alt="Herbarium specimen" className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="aspect-[12/17] w-[28vw] overflow-hidden rounded-sm border sm:w-60 lg:w-64">
                      <img src={homeImages[2]} alt="Herbarium specimen" className="h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
              {/* ^ the magic: md:-mr-[calc(50vw-50%+1rem)] + matching padding */}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-border/40 bg-muted/30 border-t border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-3 gap-2 md:gap-8">
              {currentHerbarium.stats.map((stat, index) => {
                const icons = [
                  {
                    Icon: Layers,
                    bgClass: 'bg-ring/5',
                    iconClass: 'text-ring',
                  },
                  {
                    Icon: Earth,
                    bgClass: 'bg-ring/5',
                    iconClass: 'text-ring',
                  },
                  {
                    Icon: ChartSpline,
                    bgClass: 'bg-ring/5',
                    iconClass: 'text-ring',
                  },
                ]
                const { Icon, bgClass, iconClass } = icons[index] || icons[0]

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center gap-4 text-center md:flex-row md:text-left"
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bgClass}`}>
                      <Icon className={`h-6 w-6 ${iconClass}`} />
                    </div>
                    <div>
                      <p className="text-foreground text-xl font-semibold tracking-tight md:text-4xl">{stat.value}</p>
                      <p className="text-muted-foreground text-xs md:text-sm">{t(stat.label)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* First Content Section - Image on Left */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Image - Left Side */}
            <div className="order-2 lg:order-1">
              <div className="aspect-[16/10] overflow-hidden rounded-lg">
                <img src="images/fi.jpg" alt="A historical view of Florence" className="h-full w-full object-cover" />
              </div>
            </div>
            {/* Content - Right Side */}
            {/* UPDATED: Content focused on Parlatore's nomination */}
            <div className="order-1 space-y-6 lg:order-2">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit text-sm">
                  {t(currentHerbarium.sections[0].badge)}
                </Badge>
                <h2 className="text-3xl font-medium tracking-tight text-gray-900 md:text-4xl dark:text-white">
                  {t(currentHerbarium.sections[0].title)}
                </h2>
              </div>
              <p className="text-primary/80">{t(currentHerbarium.sections[0].description)}</p>
              <Button className="bg-ring hover:bg-ring/80 rounded-full px-6 py-5 text-white">
                {t('herbaria-pages.buttons.learn-more')}
              </Button>
            </div>
          </div>
        </section>

        {/* Second Content Section - Image on Right */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Content - Left Side */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit text-sm">
                  {t(currentHerbarium.sections[1].badge)}
                </Badge>
                <h2 className="text-3xl font-medium tracking-tight text-gray-900 md:text-4xl dark:text-white">
                  {t(currentHerbarium.sections[1].title)}
                </h2>
              </div>
              <p className="text-primary/80">{t(currentHerbarium.sections[1].description)}</p>
              <Button className="bg-ring hover:bg-ring/80 rounded-full px-6 py-5 text-white">
                {t('herbaria-pages.buttons.explore')}
              </Button>
            </div>
            {/* Image - Right Side */}
            <div>
              <div className="aspect-[16/10] overflow-hidden rounded-lg">
                <img
                  src={currentHerbarium.sections[1].image}
                  alt="A map showing global plant distribution"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Third Content Section - Image on Left */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Image - Left Side */}
            <div className="order-2 lg:order-1">
              <div className="border-muted aspect-[16/10] overflow-hidden rounded-lg border">
                <img
                  src={currentHerbarium.sections[2].image}
                  alt="A historical botanical illustration"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            {/* Content - Right Side */}
            <div className="order-1 space-y-6 lg:order-2">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit text-sm">
                  {t(currentHerbarium.sections[2].badge)}
                </Badge>
                <h2 className="text-3xl font-medium tracking-tight text-gray-900 md:text-4xl dark:text-white">
                  {t(currentHerbarium.sections[2].title)}
                </h2>
              </div>
              <p className="text-primary/80">{t(currentHerbarium.sections[2].description)}</p>
            </div>
          </div>
        </section>

        {/* Footer */}
      </div>
      <Footer />
    </>
  )
}
