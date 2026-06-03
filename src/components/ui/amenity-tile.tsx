import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface AmenityTileProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
}

export function AmenityTile({ label, checked, onChange, id }: AmenityTileProps) {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        checked
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-500/10"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      )}
    >
      {checked && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-white">
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
      )}
      <span className="text-center leading-tight">{label}</span>
    </button>
  )
}

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-muted/20 p-4 md:p-5 space-y-4",
        className
      )}
    >
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
