import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen flex-col items-center space-y-4 p-4">
      <h1 className="text-center text-xl font-bold">Link rapidi</h1>
      <div className="text-center">
        <Button asChild>
          <Link to="/search">Search</Link>
        </Button>
      </div>
      <div className="text-center">
        <Button asChild>
          <Link to="/$herbariaId" params={{ herbariaId: 'PI' }}>
            PI
          </Link>
        </Button>
      </div>
      <div className="text-center">
        <Button asChild>
          <Link to="/$herbariaId/search" params={{ herbariaId: 'TSB' }}>
            TSB
          </Link>
        </Button>
      </div>
      <p>{t('herbaria-hero')}</p>
    </div>
  )
}
