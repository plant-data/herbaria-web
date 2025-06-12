import { Link, createFileRoute } from '@tanstack/react-router'
import { Database, Globe, Leaf, MapPin, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/$herbariaId/')({
  loader: async ({ params }) => {
    console.log(params['herbariaId'])
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className=" mx-auto pl-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Text - Left Side */}
          <div className="space-y-6 lg:ml-10">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit">
                <Leaf className="w-4 h-4 mr-2" />
                Lorem Ipsum
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                Lorem Ipsum Dolor
                <span className="text-ring dark:text-green-400 block">
                  Sit Amet Consectetur
                </span>
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Lorem ipsum dolor sit..."
                  className="h-10 pl-10 pr-4 py-3 w-full sm:w-60 text-base"
                />
              </div>
              <Button asChild variant='default' className='bg-ring' size="lg">
                <Link to="/search">
                  <Database className="w-5 h-5 mr-2" />
                  Dolor Sit Amet
                </Link>
              </Button>
            </div>
          </div>

          {/* Images Grid - Right Side */}
          <div className="flex gap-4 items-center justify-start w-full overflow-hidden">
            {/* First image - slightly lower */}
            <div className="mt-8 sm:block">
              <div className="border-2 border-input aspect-[4/6] w-32 sm:w-60 lg:w-64 bg-gradient-to-br from-green-200 to-green-300 dark:from-green-800 dark:to-green-900 rounded-sm overflow-hidden">
                <img
                  src="http://137.204.21.175:8000/unsafe/704x1000//2024/05/06/CP2/CP2_20240506_BATCH_0001/JPG/FI-HCI-00204271.jpg"
                  alt="Herbarium specimen FI-HCI-00206738"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Second image - higher */}
            <div className="-mt-4 md:block">
              <div className="border-2 border-input aspect-[4/6] w-32 sm:w-60 lg:w-64 bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-800 dark:to-emerald-900 rounded-sm overflow-hidden">
                <img
                  src="http://137.204.21.175:8000/unsafe/704x1000//2024/05/06/CP2/CP2_20240506_BATCH_0001/JPG/FI-HCI-00206738.jpg"
                  alt="Herbarium specimen FI-HCI-00206738"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Third image - slightly lower */}
            <div className="mt-6 hidden lg:block">
              <div className=" border-2 border-input aspect-[4/6] w-32 sm:w-40 lg:w-64 bg-gradient-to-br from-teal-200 to-teal-300 dark:from-teal-800 dark:to-teal-900 rounded-sm overflow-hidden">
                <img
                  src="http://137.204.21.175:8000/unsafe/704x1000//2024/05/06/CP2/CP2_20240506_BATCH_0001/JPG/FI-HCI-00207292.jpg"
                  alt="Herbarium specimen FI-HCI-00207292"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-ring dark:text-green-400">
                10,000+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Lorem Ipsum
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-ring dark:text-green-400">
                500+
              </div>
              <div className="text-gray-600 dark:text-gray-300">Dolor Sit</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-ring dark:text-green-400">
                50+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Consectetur
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Lorem Ipsum Dolor Sit
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim
            ad minim veniam quis nostrud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-ring dark:text-green-400" />
              </div>
              <CardTitle>Lorem Ipsum</CardTitle>
              <CardDescription>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Dolor Sit Amet</CardTitle>
              <CardDescription>
                Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Consectetur Adipiscing</CardTitle>
              <CardDescription>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="/images/flor.png"
              alt="Herbaria Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="text-xl font-bold">Lorem Ipsum</span>
          </div>
          <p className="text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do
            eiusmod tempor incididunt.
          </p>
        </div>
      </footer>
    </div>
  )
}
