import { useState } from 'react'
import { Link, useParams, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Menu } from 'lucide-react'

import { BreadcrumbResponsive } from '@/components/breadcrumb'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HERBARIA_CONFIG } from '@/features/search/constants/herbaria'
import { cn } from '@/lib/utils'
import { BASE_PATH } from '@/config'

export function Header() {
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { herbariaId } = useParams({ strict: false })
  const { t } = useTranslation()
  const { location } = useRouterState()

  const searchSegmentPresent = location.pathname.includes('/search')

  const getHerbariumName = (id: string) => {
    if (id === 'all') {
      return t('herbaria.all')
    }
    const herbarium = HERBARIA_CONFIG.find((h) => h.id === id)
    return herbarium ? t(herbarium.translationKey) : id
  }

  if (isMobile) {
    return (
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <nav className="container flex h-(--header-height) max-w-[90rem] items-center px-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-1 justify-center">
              <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                <img src={`${BASE_PATH}images/flor.png`} alt="Herbaria Logo" width={38} height={38} className="" />
                <div className="flex flex-col">
                  <span className="text-foreground font-semibold">FlorItaly Herbaria</span>
                  {herbariaId && <span className="text-xs font-medium">{getHerbariumName(herbariaId)}</span>}
                </div>
              </Link>
            </div>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label="Open menu">
                  <Menu className="size-6!" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-6 sm:w-96">
                <SheetHeader className="pb-6">
                  <SheetTitle className="text-left text-lg">FlorItaly Herbaria</SheetTitle>
                </SheetHeader>

                <div className="flex h-full flex-col justify-between gap-8">
                  {/* Breadcrumb Navigation */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">Menu</h3>
                    <BreadcrumbResponsive onLinkClick={() => setIsMenuOpen(false)} />

                    <div className="mt-4 flex flex-col gap-2">
                      <h4 className="text-sm font-medium">{t('header.herbaria')}</h4>
                      {HERBARIA_CONFIG.map((herbarium) => (
                        <Link
                          key={herbarium.id}
                          to="/$herbariaId"
                          params={{ herbariaId: herbarium.id }}
                          className="text-muted-foreground hover:text-foreground text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t(herbarium.translationKey)}
                        </Link>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      <h4 className="text-sm font-medium">{t('header.other')}</h4>
                      <Link
                        to="/about"
                        className="text-muted-foreground hover:text-foreground text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('header.about')}
                      </Link>
                      <a
                        href="https://florytaly.plantdata.it"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground text-sm"
                      >
                        {t('header.returnToFlorItaly')}
                      </a>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="mt-20 flex flex-col gap-6">
                    <div className="flex justify-center gap-8">
                      {/*   <ThemeToggle /> */}
                      <LanguageToggle />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>
    )
  }

  // the search page is optimized for larger screens so the navbar shouls adapt to it
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <nav className={cn('mx-auto flex h-(--header-height) max-w-[90rem] items-center justify-between pr-6 pl-4')}>
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <img src={`${BASE_PATH}images/flor.png`} alt="Herbaria Logo" width={38} height={38} className="" />
            <span className="text-md text-foreground hidden font-semibold sm:inline-block">FlorItaly Herbaria</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <BreadcrumbResponsive />
          </div>
        </div>

        {/* Theme and Language Controls */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1">
                {t('header.herbaria')}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {HERBARIA_CONFIG.map((herbarium) => (
                <DropdownMenuItem key={herbarium.id} asChild>
                  <Link to="/$herbariaId" params={{ herbariaId: herbarium.id }}>
                    {t(herbarium.translationKey)}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1">
                {t('header.other')}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/about">{t('header.about')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://florytaly.plantdata.it" target="_blank" rel="noopener noreferrer">
                  {t('header.returnToFlorItaly')}
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/*  <ThemeToggle /> */}
          <LanguageToggle />
        </div>
      </nav>
    </header>
  )
}
