import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TrashButtonProps {
  itemCount?: number
  onTrashClick?: () => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

export function FilterTrashButton({ itemCount = 0, onTrashClick, disabled = false, size = "md" }: TrashButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const badgeSizes = {
    sm: "h-4 w-4 text-xs",
    md: "h-5 w-5 text-xs",
    lg: "h-6 w-6 text-sm",
  }

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        size="icon"
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          border-1 
          transition-all 
          duration-200 
          hover:border-red-300 
          hover:bg-red-50 
          hover:text-red-600
          focus:border-red-300 
          focus:bg-red-50 
          focus:text-red-600
          disabled:opacity-50 
          disabled:cursor-not-allowed
          ${isHovered ? "shadow-sm" : "shadow-xs"}
        `}
        onClick={onTrashClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Delete ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
      >
        <Trash2 className={`${iconSizes[size]} transition-transform duration-200 ${isHovered ? "scale-110" : ""}`} />
      </Button>

      {itemCount > 0 && (
        <div
          className={`
            absolute 
            -top-1 
            -right-1 
            ${badgeSizes[size]}
            bg-primary
            text-secondary 
            text-[10px]
            rounded-full 
            flex 
            items-center 
            justify-center 
            font-semibold 
            shadow-lg 
            border-2 
            border-white
            animate-in 
            zoom-in-50 
            duration-200
          `}
          aria-label={`${itemCount} items selected`}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </div>
      )}
    </div>
  )
}
