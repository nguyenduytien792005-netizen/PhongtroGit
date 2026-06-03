import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const variants = {
  default: {
    card: "border-indigo-100/80 bg-gradient-to-br from-indigo-50/90 via-white to-white dark:from-indigo-950/30 dark:to-card dark:border-indigo-900/50",
    icon: "bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20 dark:bg-indigo-900/50 dark:text-indigo-400",
    value: "text-slate-900 dark:text-indigo-100",
    accent: "from-indigo-500/5 to-transparent",
  },
  success: {
    card: "border-emerald-100/80 bg-gradient-to-br from-emerald-50/90 via-white to-white dark:from-emerald-950/30 dark:to-card dark:border-emerald-900/50",
    icon: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-900/50 dark:text-emerald-400",
    value: "text-slate-900 dark:text-emerald-100",
    accent: "from-emerald-500/5 to-transparent",
  },
  info: {
    card: "border-sky-100/80 bg-gradient-to-br from-sky-50/90 via-white to-white dark:from-sky-950/30 dark:to-card dark:border-sky-900/50",
    icon: "bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20 dark:bg-sky-900/50 dark:text-sky-400",
    value: "text-slate-900 dark:text-sky-100",
    accent: "from-sky-500/5 to-transparent",
  },
  warning: {
    card: "border-amber-100/80 bg-gradient-to-br from-amber-50/90 via-white to-white dark:from-amber-950/30 dark:to-card dark:border-amber-900/50",
    icon: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:bg-amber-900/50 dark:text-amber-400",
    value: "text-slate-900 dark:text-amber-100",
    accent: "from-amber-500/5 to-transparent",
  },
  danger: {
    card: "border-rose-100/80 bg-gradient-to-br from-rose-50/90 via-white to-white dark:from-rose-950/30 dark:to-card dark:border-rose-900/50",
    icon: "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20 dark:bg-rose-900/50 dark:text-rose-400",
    value: "text-slate-900 dark:text-rose-100",
    accent: "from-rose-500/5 to-transparent",
  },
  purple: {
    card: "border-violet-100/80 bg-gradient-to-br from-violet-50/90 via-white to-white dark:from-violet-950/30 dark:to-card dark:border-violet-900/50",
    icon: "bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20 dark:bg-violet-900/50 dark:text-violet-400",
    value: "text-slate-900 dark:text-violet-100",
    accent: "from-violet-500/5 to-transparent",
  },
} as const

type StatVariant = keyof typeof variants

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  variant?: StatVariant
  subtitle?: string
  trend?: { label: string; positive?: boolean }
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
  subtitle,
  trend,
  className,
}: StatCardProps) {
  const styles = variants[variant]

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-4 md:p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        styles.card,
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60",
          styles.accent
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[11px] md:text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p
            className={cn(
              "text-xl md:text-2xl lg:text-3xl font-bold tracking-tight tabular-nums",
              styles.value
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] md:text-xs text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] md:text-xs font-medium",
                trend.positive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {trend.positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.label}
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl p-2.5 md:p-3 transition-transform duration-200 group-hover:scale-110",
            styles.icon
          )}
        >
          <Icon className="h-4 w-4 md:h-5 md:w-5" />
        </div>
      </div>
    </div>
  )
}

export function safePercent(part: number, total: number, decimals = 1): string {
  if (!total || total <= 0 || !Number.isFinite(part) || !Number.isFinite(total)) {
    return `0.${"0".repeat(decimals)}`
  }
  return ((part / total) * 100).toFixed(decimals)
}
