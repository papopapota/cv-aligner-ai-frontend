import * as React from "react"

import { cn } from "cn"

function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex min-h-64 flex-col items-center justify-center gap-4 border border-dashed border-line bg-card p-8 text-center",
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="flex size-12 items-center justify-center border border-line text-primary [&_svg]:size-6">
          {icon}
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <p className="text-xl text-ink">{title}</p>
        {description ? (
          <p className="text-base text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export { EmptyState }
