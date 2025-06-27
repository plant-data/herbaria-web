import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'

import { BreadcrumbResponsive } from '@/components/breadcrumb'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

export function Header() {
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (isMobile) {
    return (
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <nav className="container flex h-[var(--header-height)] max-w-screen-2xl items-center px-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-1 justify-center">
              <Link
                to="/"
                className="flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <img
                  src="/images/flor.png"
                  alt="Herbaria Logo"
                  width={38}
                  height={38}
                  className=""
                />
                <span className="text-md text-foreground font-semibold">
                  FlorItaly
                </span>
              </Link>
            </div>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  aria-label="Open menu"
                >
                  <Menu className="!size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-6 sm:w-96">
                <SheetHeader className="pb-6">
                  <SheetTitle className="text-left text-lg">
                    FlorItaly
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-8 justify-between h-full">
                  {/* Breadcrumb Navigation */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                      Menu
                    </h3>
                    <BreadcrumbResponsive onLinkClick={() => setIsMenuOpen(false)} />
                  </div>

                  {/* Controls */}
                  <div className="mt-20 flex flex-col gap-6">
                    <div className="flex justify-center gap-8">
                      <ThemeToggle />
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

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <nav className="container flex h-[var(--header-height)] max-w-screen-2xl items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <img
              src="/images/flor.png"
              alt="Herbaria Logo"
              width={38}
              height={38}
              className=""
            />
            <span className="text-md text-foreground hidden font-semibold sm:inline-block">
              FlorItaly
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <BreadcrumbResponsive />
          </div>
        </div>

        {/* Theme and Language Controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </nav>
    </header>
  )
}
