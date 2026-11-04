"use client"

import { useState } from "react"

import { useDeleteApplicationMutation } from "../api/delete-application"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  buttonVariants,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
  Spinner,
} from "@/shared/ui"

interface DeleteApplicationDialogProps {
  applicationId: number
  jobTitle: string
}

export function DeleteApplicationDialog({
  applicationId,
  jobTitle,
}: DeleteApplicationDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const mutation = useDeleteApplicationMutation()

  const handleDelete = async () => {
    setSubmitError(null)

    try {
      await mutation.mutateAsync(applicationId)
      setOpen(false)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la postulación."
      )
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      setSubmitError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="text-base text-ink underline underline-offset-4 transition-colors hover:text-destructive">
        Eliminar
      </DialogTrigger>

      <DialogPopup>
        <div className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Eliminar postulación</DialogTitle>
            <DialogDescription>
              Se eliminará permanentemente la postulación a «{jobTitle}». Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {submitError ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <DialogClose
              className={buttonVariants({ variant: "outline" })}
              disabled={mutation.isPending}
            >
              Cancelar
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Spinner />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogPopup>
    </Dialog>
  )
}
