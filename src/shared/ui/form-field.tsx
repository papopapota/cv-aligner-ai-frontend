import * as React from "react"

import { cn } from "cn"

function FormField({
  className,
  id,
  label,
  error,
  hint,
  children,
}: React.ComponentProps<"div"> & {
  id: string
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div data-slot="form-field" className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export { FormField }
