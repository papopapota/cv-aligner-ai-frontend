import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { DeleteApplicationDialog } from "@/features/delete-application"

const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <DeleteApplicationDialog applicationId={1} jobTitle="Analista de datos" />
    </QueryClientProvider>
  )
}

describe("DeleteApplicationDialog", () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it("pide confirmación antes de eliminar la postulación", async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole("button", { name: "Eliminar" }))

    const dialog = await screen.findByRole("dialog")
    expect(
      within(dialog).getByText(/Se eliminará permanentemente/)
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("envía DELETE /applications/{id} al confirmar", async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204))

    renderDialog()

    await user.click(screen.getByRole("button", { name: "Eliminar" }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/applications/1"),
        expect.objectContaining({ method: "DELETE" })
      )
    })
  })
})
