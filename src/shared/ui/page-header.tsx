import * as React from "react"

import { cn } from "cn"

function PageHeader({
  className,
  title,
  description,
  actions,
  ...props
}: React.ComponentProps<"div"> & {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="flex max-w-3xl flex-col gap-2">
        <h1 className="text-[28.432px] leading-[1.4] font-normal text-ink">
          {title}
        </h1>
        {description ? (
          <p className="text-base text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  )
}

export { PageHeader }
