import { Link } from '@tanstack/react-router'
import { ArrowLeft, List, Home, Search } from 'lucide-react'

import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { BreadcrumbResponsive } from './breadcrumb'

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
