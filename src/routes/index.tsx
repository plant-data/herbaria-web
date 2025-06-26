import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Building2, Database, Search } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFilterStore } from '@/features/search/stores/use-filters-store'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { t } = useTranslation()
  const resetFilters = useFilterStore((state) => state.resetFilters)

  return (
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
                <img
                  src="/images/global-search.png"
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="mb-4 flex-1">
                Search across all herbaria collections and explore botanical
                diversity worldwide
              </p>
              <Link
                to="/search"
                onClick={() => resetFilters()}
                className="bg-ring hover:bg-ring/80 mt-auto inline-flex w-full items-center justify-center rounded-lg px-4 py-3 font-medium text-white transition-colors duration-200 focus:ring-2"
              >
                <Search className="mr-2 h-4 w-4" />
                Explore
              </Link>
            </CardContent>
          </Card>

          {/* PI Herbarium Card */}
          <Card className="group flex flex-col border shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-700">
            <Badge className="mx-6 mb-[-10px]" variant="outline">
              Herbarium PI
            </Badge>
            <CardHeader>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-ring/10 rounded-lg p-2 transition-transform duration-300 group-hover:scale-110">
                    <Building2 className="text-ring h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {t('herbaria.pi')}
                    </CardTitle>
                  </div>
                </div>
              </div>
              <div className="border-input h-40 overflow-hidden rounded-lg border">
                <img
                  src="/images/pi.png"
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="mb-4 flex-1">
                Explore the rich botanical heritage of the University of Pisa's
                herbarium collection
              </p>
              <Link
                to="/$herbariaId"
                params={{ herbariaId: 'PI' }}
                className="hover:bg-ring-80 mt-auto inline-flex w-full items-center justify-center rounded-lg bg-ring px-4 py-3 font-medium text-white transition-colors duration-200 focus:ring-2"
              >
                <Search className="mr-2 h-4 w-4" />
                Explore
              </Link>
            </CardContent>
          </Card>

          {/* TSB Herbarium Card */}
          <Card className="group flex flex-col border shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 dark:hover:border-emerald-700">
            <CardHeader>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-emerald-100 p-2 transition-transform duration-300 group-hover:scale-110 dark:bg-emerald-900/30">
                    <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {t('herbaria.tsb')}
                    </CardTitle>
                  </div>
                </div>
             
              </div>
               <div className="border-input h-40 overflow-hidden rounded-lg border">
                <img
                  src="/images/tsb.png"
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="mb-4 flex-1 text-gray-600 dark:text-gray-300">
                Discover botanical specimens from the Trieste Science Museum's
                specialized collection
              </p>
              <Link
                to="/$herbariaId/search"
                params={{ herbariaId: 'TSB' }}
                className="mt-auto inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition-colors duration-200 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none"
              >
                <Building2 className="mr-2 h-4 w-4" />
                Explore TSB Collection
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
