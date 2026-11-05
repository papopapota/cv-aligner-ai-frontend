"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import {
  applicationStatusLabels,
  applicationStatuses,
  useApplicationsQuery,
  type ApplicationStatus,
} from "@/entities/application"
import { CreateApplicationDialog } from "@/features/create-application"
import { DeleteApplicationDialog } from "@/features/delete-application"
import { ApplicationStatusSelect } from "@/features/update-application-status"
import { ApiError } from "@/shared/api/query-client"
import {
  Input,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui"

import {
  APPLICATIONS_PAGE_SIZE,
  filterApplications,
  formatApplicationDate,
  type ApplicationDateOrder,
  type ApplicationStatusFilter,
} from "../model/filter-applications"
import { ApplicationDetailsDialog } from "./application-details-dialog"

export function ApplicationsTable() {
  const { data, isPending, isError, error } = useApplicationsQuery()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ApplicationStatusFilter>("all")
  const [dateOrder, setDateOrder] = useState<ApplicationDateOrder>("newest")
  const [page, setPage] = useState(1)

  const applications = useMemo(() => data ?? [], [data])

  const filteredApplications = useMemo(
    () =>
      filterApplications(applications, {
        search,
        status: statusFilter,
        dateOrder,
      }),
    [applications, search, statusFilter, dateOrder]
  )

  const pageCount = Math.max(
    1,
    Math.ceil(filteredApplications.length / APPLICATIONS_PAGE_SIZE)
  )
  const currentPage = Math.min(page, pageCount)
  const visibleApplications = filteredApplications.slice(
    (currentPage - 1) * APPLICATIONS_PAGE_SIZE,
    currentPage * APPLICATIONS_PAGE_SIZE
  )

  const resetPage = () => setPage(1)

  const errorMessage = isError
    ? error instanceof ApiError && error.status === 401
      ? "Inicia sesión para ver tus postulaciones."
      : error.message
    : null

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        className="border-0 pb-0"
        title="Control de Postulaciones"
        description="Registra tus candidaturas y actualiza el estado de cada proceso."
        descriptionClassName="text-ink"
        actions={<CreateApplicationDialog />}
      />

      <div className="flex flex-col gap-4 border border-line bg-canvas p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink"
          />
          <Input
            type="search"
            aria-label="Buscar por puesto o empresa"
            placeholder="Buscar por puesto o empresa"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              resetPage()
            }}
            className="h-11 bg-canvas pl-10"
          />
        </div>

        <Select
          aria-label="Filtrar por estado"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as ApplicationStatusFilter)
            resetPage()
          }}
          className="w-full sm:w-48"
        >
          <option value="all">Estado: Todos</option>
          {applicationStatuses.map((status: ApplicationStatus) => (
            <option key={status} value={status}>
              {applicationStatusLabels[status]}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Ordenar por fecha"
          value={dateOrder}
          onChange={(event) => {
            setDateOrder(event.target.value as ApplicationDateOrder)
            resetPage()
          }}
          className="w-full sm:w-40"
        >
          <option value="newest">Fecha: recientes</option>
          <option value="oldest">Fecha: antiguas</option>
        </Select>
      </div>

      <div className="border border-line bg-canvas">
        <Table className="min-w-[1248px]">
          <TableHeader>
            <TableRow className="h-14 border-0">
              <TableHead className="w-[352px]">Puesto</TableHead>
              <TableHead className="w-[280px]">Empresa</TableHead>
              <TableHead className="w-[256px]">Fecha</TableHead>
              <TableHead className="w-[200px]">Estado</TableHead>
              <TableHead className="w-[160px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isPending ? (
              <TableRow className="h-20">
                <TableCell colSpan={5} className="text-muted-foreground">
                  Cargando postulaciones...
                </TableCell>
              </TableRow>
            ) : null}

            {errorMessage ? (
              <TableRow className="h-20">
                <TableCell colSpan={5}>
                  <p role="alert" className="text-destructive">
                    {errorMessage}
                  </p>
                </TableCell>
              </TableRow>
            ) : null}

            {!isPending && !errorMessage && visibleApplications.length === 0 ? (
              <TableRow className="h-20">
                <TableCell colSpan={5} className="text-muted-foreground">
                  {applications.length === 0
                    ? "Aún no tienes postulaciones registradas."
                    : "No hay postulaciones que coincidan con los filtros."}
                </TableCell>
              </TableRow>
            ) : null}

            {visibleApplications.map((application) => (
              <TableRow key={application.id} className="h-20">
                <TableCell className="w-[352px]">
                  {application.jobTitle}
                </TableCell>
                <TableCell className="w-[280px]">
                  {application.company}
                </TableCell>
                <TableCell className="w-[256px]">
                  {formatApplicationDate(application.createdAt)}
                </TableCell>
                <TableCell className="w-[200px]">
                  <ApplicationStatusSelect
                    applicationId={application.id}
                    status={application.status}
                  />
                </TableCell>
                <TableCell className="w-[160px]">
                  <div className="flex items-center gap-4 whitespace-nowrap">
                    <ApplicationDetailsDialog application={application} />
                    <DeleteApplicationDialog
                      applicationId={application.id}
                      jobTitle={application.jobTitle}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow className="h-12 border-0 hover:bg-transparent">
              <TableCell colSpan={3} className="py-0 text-xs">
                {filteredApplications.length}{" "}
                {filteredApplications.length === 1
                  ? "postulación registrada"
                  : "postulaciones registradas"}
              </TableCell>
              <TableCell colSpan={2} className="py-0 text-xs">
                <div className="flex items-center justify-end gap-4">
                  {pageCount > 1 ? (
                    <button
                      type="button"
                      onClick={() => setPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="underline underline-offset-4 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                  ) : null}
                  <span>
                    {currentPage} / {pageCount}
                  </span>
                  {pageCount > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPage(Math.min(pageCount, currentPage + 1))
                      }
                      disabled={currentPage === pageCount}
                      className="underline underline-offset-4 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
