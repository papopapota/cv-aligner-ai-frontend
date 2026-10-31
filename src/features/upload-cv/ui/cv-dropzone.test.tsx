import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, jest } from "@jest/globals";

import { CvDropzone } from "./cv-dropzone";

describe("CvDropzone", () => {
  it("acepta un PDF válido y notifica el archivo", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onRemove = jest.fn();

    render(<CvDropzone file={null} onChange={onChange} onRemove={onRemove} />);

    const input = screen.getByLabelText("Seleccionar archivo de CV");

    await user.upload(input, [
      new File(["contenido"], "cv.pdf", { type: "application/pdf" }),
    ]);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].name).toBe("cv.pdf");
    });
  });

  it("rechaza archivos no soportados y muestra el error", async () => {
    render(<CvDropzone file={null} onChange={jest.fn()} onRemove={jest.fn()} />);

    const input = screen.getByLabelText("Seleccionar archivo de CV");

    fireEvent.change(input, {
      target: { files: [new File(["contenido"], "cv.txt", { type: "text/plain" })] },
    });

    await waitFor(() => {
      expect(screen.getByText(/Solo se aceptan archivos PDF o DOCX/)).toBeInTheDocument();
    });
  });

  it("quita el archivo cuando se pulsa el botón de eliminar", () => {
    const onRemove = jest.fn();

    render(
      <CvDropzone
        file={{
          id: "id-1",
          name: "cv.pdf",
          size: 1024,
          type: "application/pdf",
          uploadedAt: "2024-01-01T00:00:00.000Z",
        }}
        onChange={jest.fn()}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getByLabelText("Quitar cv.pdf"));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
