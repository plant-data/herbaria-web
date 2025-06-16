import { Link } from '@tanstack/react-router'
import { ArrowLeft, List, Home, Search } from 'lucide-react'

import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function Header() {
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
              FlorItaly Herbaria
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/"
                className={cn(
                  'flex items-center gap-2',
                  '[&.active]:text-ring',
                )}
              >
                <Home className="size-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </Button>

            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/search"
                className={cn(
                  'flex items-center gap-2',
                  '[&.active]:text-ring',
                )}
              >
                <Search className="size-4" />
                <span className="hidden sm:inline">Search</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://dryades.units.it/floritaly"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <List className="size-4" />
                <span className="hidden sm:inline">Checklist</span>
              </a>
            </Button>
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
