import {
  getCompatibilityLabel,
  sampleAtsReport,
} from "@/entities/ats-report";

describe("getCompatibilityLabel", () => {
  it("clasifica puntajes altos, medios y bajos", () => {
    expect(getCompatibilityLabel(86)).toBe("Alta compatibilidad");
    expect(getCompatibilityLabel(85)).toBe("Alta compatibilidad");
    expect(getCompatibilityLabel(60)).toBe("Compatibilidad media");
    expect(getCompatibilityLabel(59)).toBe("Baja compatibilidad");
  });
});

describe("sampleAtsReport", () => {
  it("incluye métricas y recomendaciones coherentes", () => {
    expect(sampleAtsReport.score).toBe(86);
    expect(sampleAtsReport.metrics).toHaveLength(3);
    expect(sampleAtsReport.recommendations.length).toBeGreaterThan(0);
  });
});
