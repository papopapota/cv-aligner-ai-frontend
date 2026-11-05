"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Plus } from "lucide-react"

import {
  createApplicationSchema,
  useCreateApplicationMutation,
  type CreateApplicationForm,
} from "../index"
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
  FormField,
  Input,
  Spinner,
} from "@/shared/ui"

export function CreateApplicationDialog() {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const mutation = useCreateApplicationMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateApplicationForm>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      jobTitle: "",
      company: "",
    },
  })

  const onSubmit = async (data: CreateApplicationForm) => {
    setSubmitError(null)

    try {
      await mutation.mutateAsync(data)
      reset()
      setOpen(false)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo agregar la postulación."
      )
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      setSubmitError(null)
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={buttonVariants({ className: "h-11" })}>
        <Plus aria-hidden="true" />
        Agregar Postulación
      </DialogTrigger>

      <DialogPopup>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-6"
        >
          <DialogHeader>
            <DialogTitle>Agregar Postulación</DialogTitle>
            <DialogDescription>
              Registra el puesto y la empresa para hacer seguimiento al proceso.
            </DialogDescription>
          </DialogHeader>

          {submitError ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <FormField id="job-title" label="Puesto" error={errors.jobTitle?.message}>
            <Input
              id="job-title"
              placeholder="Analista de datos"
              aria-invalid={Boolean(errors.jobTitle)}
              disabled={mutation.isPending}
              {...register("jobTitle")}
            />
          </FormField>

          <FormField id="company" label="Empresa" error={errors.company?.message}>
            <Input
              id="company"
              placeholder="Empresa ABC"
              aria-invalid={Boolean(errors.company)}
              disabled={mutation.isPending}
              {...register("company")}
            />
          </FormField>

          <DialogFooter>
            <DialogClose
              className={buttonVariants({ variant: "outline" })}
              disabled={mutation.isPending}
            >
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Spinner />
                  Guardando...
                </>
              ) : (
                "Guardar postulación"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
