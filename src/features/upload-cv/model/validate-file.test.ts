import {
  formatFileSize,
  validateCvFile,
} from "./validate-file";

describe("validateCvFile", () => {
  it("acepta un PDF válido", () => {
    const file = new File(["contenido"], "cv.pdf", {
      type: "application/pdf",
    });

    expect(validateCvFile(file)).toEqual({ ok: true });
  });

  it("acepta un DOCX válido", () => {
    const file = new File(["contenido"], "cv.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    expect(validateCvFile(file)).toEqual({ ok: true });
  });

  it("rechaza un archivo vacío", () => {
    const file = new File([], "cv.pdf", { type: "application/pdf" });

    expect(validateCvFile(file)).toEqual({
      ok: false,
      message: "El archivo está vacío.",
    });
  });

  it("rechaza archivos de más de 5 MB", () => {
    const file = new File(["contenido"], "cv.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "size", { value: 5 * 1024 * 1024 + 1 });

    expect(validateCvFile(file)).toEqual({
      ok: false,
      message: "El archivo supera el tamaño máximo de 5 MB.",
    });
  });

  it("rechaza formatos no soportados", () => {
    const file = new File(["contenido"], "cv.txt", { type: "text/plain" });

    expect(validateCvFile(file)).toEqual({
      ok: false,
      message: "Solo se aceptan archivos PDF o DOCX.",
    });
  });
});

describe("formatFileSize", () => {
  it("formatea bytes, kilobytes y megabytes", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});
