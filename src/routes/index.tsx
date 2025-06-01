import { createFileRoute } from '@tanstack/react-router'
import logo from '../logo.svg'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { t } = useTranslation()
  return (
    <div className="text-center">
      <Button> Test Button</Button>
      <p>{t('herbaria-hero')}</p>
    </div>
  )
}
