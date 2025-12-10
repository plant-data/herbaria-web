import { createLazyFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Filter, Globe, Map as MapIcon, Search, Database } from 'lucide-react'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createLazyFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  const { t } = useTranslation()

  const guideSteps = [
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      title: t('about.guide.collections.title'),
      description: t('about.guide.collections.description'),
    },
    {
      icon: <Search className="h-6 w-6 text-primary" />,
      title: t('about.guide.search.title'),
      description: t('about.guide.search.description'),
    },
    {
      icon: <Filter className="h-6 w-6 text-primary" />,
      title: t('about.guide.filters.title'),
      description: t('about.guide.filters.description'),
    },
    {
      icon: <MapIcon className="h-6 w-6 text-primary" />,
      title: t('about.guide.map.title'),
      description: t('about.guide.map.description'),
    },
  ]

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
              {t('about.title')}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t('about.subtitle')}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 max-w-5xl space-y-16">
          {/* Project Description */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-semibold tracking-tight">{t('about.project.title')}</h2>
            </div>
            <div className="prose dark:prose-invert max-w-none text-foreground/80 leading-relaxed">
              <p>{t('about.project.description_1')}</p>
              <p>{t('about.project.description_2')}</p>
            </div>
          </section>

          {/* How to Use Guide */}
          <section>
            <h2 className="text-3xl font-semibold tracking-tight mb-8 text-center">
              {t('about.guide.title')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {guideSteps.map((step, index) => (
                <Card key={index} className="border-border/60 shadow-sm hover:border-primary/50 transition-colors">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {step.icon}
                    </div>
                    <CardTitle className="text-xl font-medium">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}
