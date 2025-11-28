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
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[550px_1fr] lg:grid-cols-[650px_1fr]">
              {/* Hero Text - Left Side (stays aligned with container) */}
              <div className="space-y-6">
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

                <p className="text-primary/80 max-w-lg">{t(currentHerbarium?.hero?.description)}</p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative min-w-[300px]">
                    <AutocompleteSimple
                      placeholder={t('search.filters.scientific-name-placeholder')}
                      queryKey={['simplesearch', herbariaId]}
                      query={
                        `${BASE_API_URL}autocomplete?` +
                        (herbariaId ? `institutionCode=${herbariaId}&` : '') +
                        `field=scientificName&value=`
                      }
                      onSelectedValueChange={handleScientificNameSelected}
                    />
                  </div>
                  <Button
                    asChild
                    variant="default"
                    className="bg-ring"
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
                    <div className="border-primary/30 aspect-[4/6] w-[28vw] overflow-hidden rounded-sm border sm:w-60 lg:w-64">
                      <img src={homeImages[0]} alt="Herbarium specimen" className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div className="-mt-4">
                    <div className="border-primary/30 aspect-[4/6] w-[28vw] overflow-hidden rounded-sm border sm:w-60 lg:w-64">
                      <img src={homeImages[1]} alt="Herbarium specimen" className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="border-primary/30 aspect-[4/6] w-[28vw] overflow-hidden rounded-sm border sm:w-60 lg:w-64">
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
        {/* <section className="container mx-auto mb-12 hidden grid-cols-2 gap-8 px-4 text-center sm:grid md:grid-cols-4">
          <Card className="border-input/40 flex w-60 items-center justify-center space-y-2 shadow-none">
            <CardDescription className="flex flex-col items-center gap-2">
              <Leaf className="text-ring size-9" />
              <span className="text-primary/80 text-4xl font-medium">2 million+</span>
              <span className="text-primary/80">Specimens</span>
            </CardDescription>
          </Card>
          <Card className="border-input/40 flex w-60 items-center justify-center space-y-2 shadow-none">
            <CardDescription className="flex flex-col items-center gap-2">
              <Layers className="text-ring size-9" />
              <span className="text-primary/80 text-4xl font-medium">18,000+</span>
              <span className="text-primary/80">Type Specimens</span>
            </CardDescription>
          </Card>
          <Card className="border-input/40 flex w-60 items-center justify-center space-y-2 shadow-none">
            <CardDescription className="flex flex-col items-center gap-2">
              <Earth className="text-ring size-9" />
              <span className="text-primary/80 text-4xl font-medium">70%</span>
              <span className="text-primary/80">Georeferenced records</span>
            </CardDescription>
          </Card>
          <Card className="border-input/40 flex w-60 items-center justify-center space-y-2 shadow-none">
            <CardDescription className="flex flex-col items-center gap-2">
              <ChartSpline className="text-ring size-9" />
              <span className="text-primary/80 text-4xl font-medium">200+</span>
              <span className="text-primary/80">Years of Collection</span>
            </CardDescription>
          </Card>
        </section> */}

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
              <Button className="bg-ring hover:bg-ring/90 text-white">{t('herbaria-pages.buttons.learn-more')}</Button>
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
              <Button className="bg-ring hover:bg-ring/90 text-white">{t('herbaria-pages.buttons.explore')}</Button>
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
              <div className="border-primary/40 aspect-[16/10] overflow-hidden rounded-lg border">
                <img
                  src={currentHerbarium.sections[2].image}
                  alt="A historical botanical illustration"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            {/* Content - Right Side */}
            {/* UPDATED: More scientific language */}
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
