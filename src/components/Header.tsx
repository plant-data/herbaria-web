import { Link } from '@tanstack/react-router'
import { ThemeToggle } from './theme-toggle'

export default function Header() {
  return (
    <header className="p-2 flex gap-2 bg-background text-primary justify-between">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/tanstack-query">TanStack Query</Link>
        </div>
        <ThemeToggle />
      </nav>
    </header>
  )
}
