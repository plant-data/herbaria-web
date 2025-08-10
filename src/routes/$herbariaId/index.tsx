import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChartSpline, Database, Earth, Layers, Leaf } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BASE_API_URL, BASE_IMAGE_URL } from '@/config'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { HERBARIA_CONFIG } from '@/features/search/constants/herbaria'
import { AutocompleteSimple } from '@/features/search/components/autocomplete-simple'

export const Route = createFileRoute('/$herbariaId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const { herbariaId } = Route.useParams()
  const navigate = useNavigate()
  const resetFilters = useFilterStore((state) => state.resetFilters)
  const setScientificName = useFilterStore((state) => state.setScientificName)

  // Find the current herbarium configuration
  const currentHerbarium = HERBARIA_CONFIG.find((herbarium) => herbarium.id === herbariaId.toUpperCase())

  // Use homeImages if available, otherwise fallback to default images
  const homeImages = currentHerbarium?.homeImages || [
    `${BASE_IMAGE_URL}unsafe/704x1000//2024/05/06/CP2/CP2_20240506_BATCH_0001/JPG/FI-HCI-00204271.jpg`,
    `${BASE_IMAGE_URL}unsafe/704x1000//2024/05/06/CP2/CP2_20240506_BATCH_0001/JPG/FI-HCI-00206738.jpg`,
    `${BASE_IMAGE_URL}unsafe/704x1000//2024/05/06/CP2/CP2_20240506_BATCH_0001/JPG/FI-HCI-00207292.jpg`,
  ]

  const handleScientificNameSelected = (value: string) => {
    resetFilters()
    setScientificName([value])
    navigate({
      to: '/$herbariaId/search',
      params: { herbariaId },
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="mx-auto py-16 pr-4 pl-4 sm:pr-0 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[550px_1fr] lg:grid-cols-[650px_1fr]">
          {/* Hero Text - Left Side */}
          <div className="space-y-6 lg:ml-10">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit">
                <Leaf className="mr-2 h-4 w-4" />
                Herbarium FI-HCI
              </Badge>
              <h1 className="text-primary text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
                Herbarium Centrale Italicum of
                <span className="text-ring"> Florence</span>
              </h1>
            </div>
            {/* UPDATED: More scientific tone */}
            <p className="text-primary/80 max-w-lg">
              Established in 1842, the Herbarium Centrale Italicum (FI-HCI) was conceived as a national institution to
              centralize botanical research. It serves as an essential repository for systematic and phytogeographical
              studies, housing a global collection of plant specimens.
            </p>
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
              <Button asChild variant="default" className="bg-ring" size="lg" onClick={() => resetFilters()}>
                <Link to="/$herbariaId/search" params={{ herbariaId }}>
                  <Database className="mr-2 h-5 w-5" />
                  Explore the Collection
                </Link>
              </Button>
            </div>
          </div>

          {/* Images Grid - Right Side */}
          <div className="flex w-full items-center justify-around gap-4 overflow-hidden sm:justify-start">
            <div className="mt-8 sm:block">
              <div className="border-primary/30 aspect-[4/6] w-[28vw] overflow-hidden rounded-sm border sm:w-60 lg:w-64">
                <img src={homeImages[0]} alt="Herbarium specimen" className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="-mt-4 md:block">
              <div className="border-primary/30 aspect-[4/6] w-[28vw] overflow-hidden rounded-sm border sm:w-60 lg:w-64">
                <img src={homeImages[1]} alt="Herbarium specimen" className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="mt-6 md:block">
              <div className="border-primary/30 aspect-[4/6] w-[28vw] overflow-hidden rounded-sm border sm:w-60 lg:w-64">
                <img src={homeImages[2]} alt="Herbarium specimen" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto mb-12 grid grid-cols-2 gap-8 px-4 text-center md:grid-cols-4">
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
                History
              </Badge>
              <h2 className="text-3xl font-medium tracking-tight text-gray-900 md:text-4xl dark:text-white">
                About the Herbarium
              </h2>
            </div>
            <p className="text-primary/80">
              Proposed in 1841 by Filippo Parlatore to centralize Italy's botanical collections, the Herbarium was
              officially established in 1842 under his direction, with the approval of the Grand Duke of Tuscany.
            </p>
            <Button className="bg-ring hover:bg-ring/90 text-white">Learn More</Button>
          </div>
        </div>
      </section>

      {/* Second Content Section - Image on Right */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Content - Left Side */}
          {/* UPDATED: More scientific language and examples */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit text-sm">
                Geographic distribution
              </Badge>
              <h2 className="text-3xl font-medium tracking-tight text-gray-900 md:text-4xl dark:text-white">
                A Global Collection
              </h2>
            </div>
            <p className="text-primary/80">
              The herbarium scope is not limited to the boundaries of Italy. It includes significant international
              holdings from collectors like Philip Barker Webb, Antonio Figari, and Joseph Dalton Hooker.
            </p>
            <Button className="bg-ring hover:bg-ring/90 text-white">Explore</Button>
          </div>
          {/* Image - Right Side */}
          <div>
            <div className="aspect-[16/10] overflow-hidden rounded-lg">
              <img
                src="images/m1.png"
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
                src="images/g1.png"
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
                Heritage
              </Badge>
              <h2 className="text-3xl font-medium tracking-tight text-gray-900 md:text-4xl dark:text-white">
                More than 180 years of botanical research
              </h2>
            </div>
            <p className="text-primary/80">
              Growth was exponential from the start. The 40,000 specimens in 1842 quickly became over one million,
              providing material necessary to support the creation of the "Flora Italiana".
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 bg-gray-900 py-8 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <img src="/images/flor.png" alt="Herbaria Logo" width={32} height={32} className="rounded-md" />
            <span className="text-xl font-bold">FlorItaly Herbaria</span>
          </div>
          {/*  <p className="text-gray-400">
            The Herbarium Centrale Italicum (FI-HCI), a cornerstone of botanical research, preserving global plant
            biodiversity since 1842.
          </p> */}
        </div>
      </footer>
    </div>
  )
}
