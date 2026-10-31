import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "cn"

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-x-3 gap-y-1 border px-4 py-3 text-base [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "border-line bg-card text-ink",
        info: "border-line bg-secondary/25 text-ink",
        destructive: "border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 font-normal", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("col-start-2 text-sm leading-[1.4] text-current/80", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
