import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <h1 className='text-center text-xl font-bold'>Link rapidi</h1>
      <div className="text-center">
        <Button asChild>
          <Link to="/search">Search</Link>
        </Button>
      </div>
      <div className="text-center">
        <Button asChild>
          <Link to="/HCI">HCI</Link>
        </Button>
      </div>
      <p>{t('herbaria-hero')}</p>
    </div>
  )
}
