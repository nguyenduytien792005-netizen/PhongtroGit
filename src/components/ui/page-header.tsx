import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4",
        className
      )}
    >
      <div>
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">{actions}</div>
      )}
    </div>
  )
}

export const primaryButtonClass =
  "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 border-0 transition-all duration-200"

export const outlineButtonClass =
  "border-border/60 hover:bg-accent transition-all duration-200"

export const premiumCardClass = "rounded-2xl border-border/60 shadow-md"
