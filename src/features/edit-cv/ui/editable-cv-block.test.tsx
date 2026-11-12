import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, jest } from "@jest/globals"

import { EditableCvBlock } from "./editable-cv-block"

const block = {
  id: "resumen-0",
  heading: "Resumen Profesional",
  body: "Texto original",
}

describe("EditableCvBlock", () => {
  it("muestra la sección sin cambios", () => {
    render(
      <EditableCvBlock
        block={block}
        originalText="Texto original"
        value="Texto original"
        onChange={() => undefined}
        onRevert={() => undefined}
      />
    )

    expect(screen.getByText("Resumen Profesional")).toBeInTheDocument()
    expect(screen.getByText("Sin cambios")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /revertir cambios/i })
    ).toBeDisabled()
    expect(
      screen.getByLabelText("Editar Resumen Profesional")
    ).toHaveValue("Texto original")
  })

  it("marca los cambios y permite revertirlos", async () => {
    const user = userEvent.setup()
    const onRevert = jest.fn()

    render(
      <EditableCvBlock
        block={block}
        originalText="Texto original"
        value="Texto optimizado"
        onChange={() => undefined}
        onRevert={onRevert}
      />
    )

    expect(screen.getByText("Modificado")).toBeInTheDocument()
    expect(
      screen.getByText("Cambios respecto al CV original")
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: /revertir cambios/i })
    )

    expect(onRevert).toHaveBeenCalledTimes(1)
  })

  it("notifica los cambios del textarea", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <EditableCvBlock
        block={block}
        originalText="Texto original"
        value=""
        onChange={onChange}
        onRevert={() => undefined}
      />
    )

    await user.type(
      screen.getByLabelText("Editar Resumen Profesional"),
      "Nuevo"
    )

    expect(onChange).toHaveBeenCalled()
  })
})
