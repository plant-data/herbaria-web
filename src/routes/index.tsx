import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Building2, Home, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFilterStore } from '@/features/search/stores/use-filters-store'
import { HERBARIA_CONFIG } from '@/features/search/constants/herbaria'
import { Footer } from '@/components/footer'

// Configuration for herbaria

export const Route = createFileRoute('/')({
  component: App,
})

function HerbariumCard({ herbarium }: { herbarium: (typeof HERBARIA_CONFIG)[0] }) {
  const { t } = useTranslation()
  const resetFilters = useFilterStore((state) => state.resetFilters)
  const resetMap = useFilterStore((state) => state.resetMap)

  return (
    <Card className="group flex flex-col border shadow-xs">
      <Badge className="mx-6 mb-[-10px]" variant="outline">
        {herbarium.badgeLabel}
      </Badge>
      <CardHeader>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-ring/10 rounded-lg p-2 transition-transform duration-300 group-hover:scale-110">
              <Building2 className="text-ring h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">{t(herbarium.translationKey)}</CardTitle>
            </div>
          </div>
        </div>
        <div className="border-input h-40 overflow-hidden rounded-lg border">
          <img src={herbarium.image} alt="" className="h-full w-full object-cover" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="mb-4 flex-1">{herbarium.description}</p>
        <div className="flex gap-4">
          <Link
            onClick={() => {
              resetFilters()
              resetMap()
            }}
            to="/$herbariaId"
            params={{ herbariaId: herbarium.id }}
            className="hover:bg-ring/80 bg-ring mt-auto inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-200 focus:ring-2"
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
          <Link
            onClick={() => {
              resetFilters()
              resetMap()
            }}
            to="/$herbariaId/search"
            params={{ herbariaId: herbarium.id }}
            className="hover:bg-ring/80 bg-ring mt-auto inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-200 focus:ring-2"
          >
            <Search className="mr-2 h-4 w-4" />
            Explore
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function App() {
  const resetFilters = useFilterStore((state) => state.resetFilters)
  const resetMap = useFilterStore((state) => state.resetMap)

  return (
    <>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold md:text-5xl">FlorItaly Herbaria</h1>
          </div>

          {/* Search and Collections Grid */}
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Global Search Card */}
            <Card className="group hover:border-border flex flex-col border shadow-xs">
              <Badge className="mx-6 mb-[-10px]" variant="outline">
                All Herbaria
              </Badge>
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-ring/10 rounded-lg p-2 transition-transform duration-300 group-hover:scale-110">
                      <Search className="text-ring h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Global Search</CardTitle>
                    </div>
                  </div>
                </div>
                <div className="border-input h-40 overflow-hidden rounded-lg border">
                  <img src="images/global-search.png" alt="" className="h-full w-full object-cover" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="mb-4 flex-1">
                  Search across all herbaria collections and explore botanical diversity worldwide
                </p>
                <Link
                  to="/search"
                  onClick={() => {
                    resetFilters()
                    resetMap()
                  }}
                  className="bg-ring hover:bg-ring/80 mt-auto inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-200 focus:ring-2"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Explore
                </Link>
              </CardContent>
            </Card>

            {/* Herbarium Cards */}
            {HERBARIA_CONFIG.map((herbarium) => (
              <HerbariumCard key={herbarium.id} herbarium={herbarium} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
