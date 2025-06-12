import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function SwitchOption({
  field,
  label,
  checked,
  onCheckedChange,
}: {
  field: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center space-x-2">
      <Switch checked={checked} onCheckedChange={onCheckedChange} id={field} />
      <Label htmlFor={field}>{label}</Label>
    </div>
  )
}
