import { Link } from '@tanstack/react-router'

import { BreadcrumbResponsive } from '@/components/breadcrumb'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'

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
