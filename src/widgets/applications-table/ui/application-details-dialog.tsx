"use client"

import { applicationStatusLabels, type Application } from "@/entities/application"
import {
  buttonVariants,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui"

import { formatApplicationDate } from "../model/filter-applications"

export function ApplicationDetailsDialog({
  application,
}: {
  application: Application
}) {
  return (
    <Dialog>
      <DialogTrigger className="text-base text-ink underline underline-offset-4 transition-colors hover:text-primary">
        Ver
      </DialogTrigger>

      <DialogPopup>
        <div className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{application.jobTitle}</DialogTitle>
            <DialogDescription>
              Detalle de la postulación registrada.
            </DialogDescription>
          </DialogHeader>

          <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-base">
            <dt className="text-muted-foreground">Empresa</dt>
            <dd className="text-ink">{application.company}</dd>

            <dt className="text-muted-foreground">Fecha</dt>
            <dd className="text-ink">
              {formatApplicationDate(application.createdAt)}
            </dd>

            <dt className="text-muted-foreground">Estado</dt>
            <dd className="text-ink">
              {applicationStatusLabels[application.status]}
            </dd>
          </dl>

          <DialogFooter>
            <DialogClose className={buttonVariants({ variant: "outline" })}>
              Cerrar
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogPopup>
    </Dialog>
  )
}
