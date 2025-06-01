import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { t } = useTranslation()
  return (
    <div className="text-center">
      <Button asChild><Link to='/search'>Search</Link></Button>
      <p>{t('herbaria-hero')}</p>
    </div>
  )
}
