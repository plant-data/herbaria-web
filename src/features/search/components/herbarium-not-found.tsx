import { useNavigate } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HERBARIA_CONFIG } from '@/features/search/constants/herbaria'

interface HerbariumNotFoundProps {
  herbariaId: string
}

export function HerbariumNotFound({ herbariaId }: HerbariumNotFoundProps) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="bg-destructive/10 rounded-full p-4">
            <AlertCircle className="text-destructive h-16 w-16" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-primary text-4xl font-bold">Herbarium Not Found</h1>
          <p className="text-muted-foreground text-xl">
            The herbarium <span className="text-primary font-semibold">"{herbariaId}"</span> does not exist.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <p className="text-muted-foreground text-sm">Available herbaria:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {HERBARIA_CONFIG.map((herbarium) => (
              <Badge
                key={herbarium.id}
                variant="outline"
                className="hover:bg-primary/10 cursor-pointer"
                onClick={() => navigate({ to: '/$herbariaId', params: { herbariaId: herbarium.id.toLowerCase() } })}
              >
                {herbarium.id}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
          <Button variant="default" onClick={() => navigate({ to: '/' })}>
            Go to Home
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
