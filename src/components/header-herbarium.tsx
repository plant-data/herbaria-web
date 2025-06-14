import { Link, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { HERBARIA } from '@/features/search/constants/constants'

export function HeaderHerbarium() {
  const { herbariaId } = useParams({ strict: false })
  const { t } = useTranslation()

  const herbariumDisplayName = herbariaId
    ? t(HERBARIA.find((h) => h.id === herbariaId)?.value || herbariaId)
    : ''

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <nav className="flex h-[var(--header-height)] items-center gap-2 px-4">
        <div className="flex items-center gap-2">
          <img
            src="/images/flor.png"
            alt="Herbaria Logo"
            width={40}
            height={40}
            className="rounded-md"
          />
        </div>

        {herbariaId && (
          <>
            <div className="px-2 text-sm text-muted-foreground">
              {herbariumDisplayName}
            </div>

            <div className="px-2 font-bold">
              <Link to="/$herbariaId" params={{ herbariaId }}>
                Home
              </Link>
            </div>
            <div className="px-2 font-bold">
              <Link to="/$herbariaId/search" params={{ herbariaId }}>
                Search
              </Link>
            </div>
          </>
        )}

        <div className="px-2 font-bold">
          <Link to="/">Select a different herbarium</Link>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </nav>
    </header>
  )
}
