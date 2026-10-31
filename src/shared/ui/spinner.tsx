import { Loader2Icon } from "lucide-react"

import { cn } from "cn"

function Spinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      aria-hidden="true"
      className={cn("size-5 animate-spin", className)}
    />
  )
}

export { Spinner }
