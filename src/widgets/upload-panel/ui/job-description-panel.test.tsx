import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { JobDescriptionPanel } from "./job-description-panel"

const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>
const JOB_URL = "https://www.linkedin.com/jobs/view/123456789"

function mockJsonResponse(payload: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as unknown as Response
}

describe("JobDescriptionPanel", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    window.sessionStorage.clear()
  })

  it("muestra el título y la empresa de la web en la tarjeta de la oferta", async () => {
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse({
        title: "Senior Frontend Engineer",
        company: "Nexa Labs",
        description: "Buscamos React y TypeScript.",
      })
    )
    const onVacancyChange = jest.fn()
    const user = userEvent.setup()

    render(<JobDescriptionPanel onVacancyChange={onVacancyChange} />)
    await user.type(screen.getByLabelText("Enlace de la oferta"), JOB_URL)
    await user.click(screen.getByRole("button", { name: "Analizar enlace" }))

    expect(
      await screen.findByText("Senior Frontend Engineer")
    ).toBeInTheDocument()
    expect(screen.getByText("Nexa Labs")).toBeInTheDocument()
    expect(onVacancyChange).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Senior Frontend Engineer",
        company: "Nexa Labs",
      })
    )
  })
})
