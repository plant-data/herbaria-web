import { Link, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Home, Search, Database } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { HERBARIA } from '@/features/search/constants/constants'

export function HeaderHerbarium() {
  const { herbariaId } = useParams({ strict: false })
  const { t } = useTranslation()

  const herbariumDisplayName = herbariaId
    ? t(HERBARIA.find((h) => h.id === herbariaId)?.value || herbariaId)
    : ''

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-[var(--header-height)] max-w-screen-2xl items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/flor.png"
              alt="Herbaria Logo"
              width={38}
              height={38}
              className=""
            />
            <span className="hidden sm:inline-block text-sm font-medium text-foreground">
              {herbariumDisplayName || 'FlorItaly Herbaria'}
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {herbariaId && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to="/$herbariaId"
                    params={{ herbariaId }}
                    activeProps={{ className: 'text-ring' }}
                    activeOptions={{ exact: true }}
                    className={cn('flex items-center gap-2')}
                  >
                    <Home className="size-4" />
                    <span className="hidden sm:inline">Home</span>
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to="/$herbariaId/search"
                    params={{ herbariaId }}
                    activeProps={{ className: 'text-ring' }}
                    className={cn('flex items-center gap-2')}
                  >
                    <Search className="size-4" />
                    <span className="hidden sm:inline">Search</span>
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to="/"
                    className={cn(
                      'flex items-center gap-2',
                      '[&.active]:text-ring',
                    )}
                  >
                    <Database className="size-4" />
                    <span className="hidden sm:inline">All Herbaria</span>
                  </Link>
                </Button>
              </>
            )}
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
