import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "cn"

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div data-slot="select-wrapper" className={cn("relative", className)}>
      <select
        data-slot="select"
        className="h-11 w-full appearance-none border border-line bg-canvas px-4 pr-10 text-base text-ink transition-colors outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink"
      />
    </div>
  )
}

export { Select }
