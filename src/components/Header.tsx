import { useState } from 'react'
import { Link, useParams, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'

import { BreadcrumbResponsive } from '@/components/breadcrumb'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { HERBARIA } from '@/features/search/constants/constants'
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
    const herbarium = HERBARIA.find((h) => h.id === id)
    return herbarium ? t(herbarium.value) : id
  }

  if (isMobile) {
    return (
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <nav className="container flex h-[var(--header-height)] max-w-screen-2xl items-center px-4">
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
                  <Menu className="!size-6" />
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
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <nav
        className={cn(
          'flex h-[var(--header-height)] max-w-screen-2xl items-center justify-between pr-6 pl-4',
          searchSegmentPresent ? 'max-w-[2120px]' : 'container mx-auto',
        )}
      >
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
          {/*  <ThemeToggle /> */}
          <LanguageToggle />
        </div>
      </nav>
    </header>
  )
}
