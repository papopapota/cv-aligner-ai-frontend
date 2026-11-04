import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ApplicationStatusSelect } from "@/features/update-application-status"

const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

function renderSelect() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ApplicationStatusSelect applicationId={1} status="pending" />
    </QueryClientProvider>
  )
}

describe("ApplicationStatusSelect", () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it("envía PATCH /applications/{id}/status al cambiar el estado", async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: 1,
        user_id: 7,
        job_title: "Analista de datos",
        company: "Empresa ABC",
        status: "accepted",
        created_at: "2026-10-18T10:00:00Z",
      })
    )

    renderSelect()

    await user.selectOptions(
      screen.getByLabelText("Estado de la postulación 1"),
      "accepted"
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/applications/1/status"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "accepted" }),
        })
      )
    })
  })
})
