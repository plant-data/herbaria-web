import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Database, Leaf, MapPin, Search } from 'lucide-react'
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
                Lorem Ipsum
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                Lorem Ipsum Dolor
                <span className="text-ring block">Sit Amet Consectetur</span>
              </h1>
            </div>
            <p className="max-w-lg text-lg text-gray-600 dark:text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
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
                  Dolor Sit Amet
                </Link>
              </Button>
            </div>
          </div>

          {/* Images Grid - Right Side */}
          <div className="flex w-full items-center justify-around gap-4 overflow-hidden sm:justify-start">
            {/* First image - slightly lower */}
            <div className="mt-8 sm:block">
              <div className="border-input aspect-[4/6] w-[28vw] overflow-hidden rounded-sm border sm:w-60 lg:w-64">
                <img src={homeImages[0]} alt="Herbarium specimen" className="h-full w-full object-cover" />
              </div>
            </div>

            {/* Second image - higher */}
            <div className="-mt-4 md:block">
              <div className="border-input aspect-[4/6] w-[28vw] overflow-hidden rounded-sm border sm:w-60 lg:w-64">
                <img src={homeImages[1]} alt="Herbarium specimen" className="h-full w-full object-cover" />
              </div>
            </div>

            {/* Third image - slightly lower */}
            <div className="mt-6 md:block">
              <div className="border-input aspect-[4/6] w-[28vw] overflow-hidden rounded-sm border sm:w-60 lg:w-64">
                <img src={homeImages[2]} alt="Herbarium specimen" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-ring text-4xl font-bold">10,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Lorem Ipsum</div>
            </div>
            <div className="space-y-2">
              <div className="text-ring text-4xl font-bold">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Dolor Sit</div>
            </div>
            <div className="space-y-2">
              <div className="text-ring text-4xl font-bold">50+</div>
              <div className="text-gray-600 dark:text-gray-300">Consectetur</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">Lorem Ipsum Dolor Sit</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua ut enim ad minim veniam quis nostrud.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <Search className="text-ring 0 h-6 w-6" />
              </div>
              <CardTitle>Lorem Ipsum</CardTitle>
              <CardDescription>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Dolor Sit Amet</CardTitle>
              <CardDescription>
                Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Consectetur Adipiscing</CardTitle>
              <CardDescription>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <img src="/images/flor.png" alt="Herbaria Logo" width={32} height={32} className="rounded-md" />
            <span className="text-xl font-bold">Lorem Ipsum</span>
          </div>
          <p className="text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt.
          </p>
        </div>
      </footer>
    </div>
  )
}
