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
        status="unchanged"
        originalText="Texto original"
        value="Texto original"
        hasLocalEdit={false}
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
        status="modified"
        originalText="Texto original"
        value="Texto optimizado"
        hasLocalEdit
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
        status="unchanged"
        originalText="Texto original"
        value=""
        hasLocalEdit
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

  it("marca una sección añadida", () => {
    render(
      <EditableCvBlock
        block={{ ...block, body: "Contenido nuevo" }}
        status="added"
        originalText=""
        value="Contenido nuevo"
        hasLocalEdit={false}
        onChange={() => undefined}
        onRevert={() => undefined}
      />
    )

    expect(screen.getByText("Añadido")).toBeInTheDocument()
    expect(
      screen.getByLabelText("Editar Resumen Profesional")
    ).toHaveValue("Contenido nuevo")
  })

  it("muestra una sección eliminada en solo lectura", () => {
    render(
      <EditableCvBlock
        block={{ ...block, body: "" }}
        status="removed"
        originalText="Texto original"
        value=""
        hasLocalEdit={false}
        onChange={() => undefined}
        onRevert={() => undefined}
      />
    )

    expect(screen.getByText("Eliminado")).toBeInTheDocument()
    expect(
      screen.getByText("Esta sección no está en el CV optimizado")
    ).toBeInTheDocument()
    expect(screen.getByText("Texto original")).toBeInTheDocument()
    expect(
      screen.queryByLabelText("Editar Resumen Profesional")
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /revertir cambios/i })
    ).toBeDisabled()
  })
})
