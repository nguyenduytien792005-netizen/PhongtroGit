import { cn } from "@/lib/utils"

const statusStyles = {
  new: "bg-indigo-50 text-indigo-700 border-indigo-200/60 ring-indigo-500/10",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/10",
  warning: "bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-500/10",
  danger: "bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-500/10",
  info: "bg-sky-50 text-sky-700 border-sky-200/60 ring-sky-500/10",
  neutral: "bg-slate-50 text-slate-600 border-slate-200/60 ring-slate-500/10",
} as const

type StatusVariant = keyof typeof statusStyles

interface StatusBadgeProps {
  children: React.ReactNode
  variant?: StatusVariant
  className?: string
}

export function StatusBadge({
  children,
  variant = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] md:text-xs font-semibold ring-1 ring-inset transition-colors",
        statusStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
