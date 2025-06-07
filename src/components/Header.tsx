import { Link } from '@tanstack/react-router'
import { ThemeToggle } from './theme-toggle'
import { LanguageToggle } from './language-toggle'
import { useNavigationHistory } from '@/hooks/use-navigation-history'

export function Header() {
  const { previousRoute } = useNavigationHistory()

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

        {/* Display previous route if available */}
        {previousRoute && (
          <div className="px-2 text-sm text-muted-foreground">
            From: {previousRoute}
          </div>
        )}

        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/tanstack-query">TanStack Query</Link>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </nav>
    </header>
  )
}
