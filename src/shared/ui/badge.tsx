import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex h-9 w-fit shrink-0 items-center justify-center gap-1.5 rounded-none border px-3 text-sm font-normal whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-4",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground",
        secondary: "border-secondary bg-secondary text-secondary-foreground",
        outline: "border-line bg-card text-ink",
        muted: "border-line bg-canvas text-muted-foreground",
        destructive: "border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
