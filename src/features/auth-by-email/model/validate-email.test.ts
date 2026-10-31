import { loginSchema, registerSchema } from "./validate-email";

describe("loginSchema", () => {
  it("acepta credenciales válidas", () => {
    const result = loginSchema.safeParse({
      email: "persona@email.com",
      password: "secreto123",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza emails inválidos", () => {
    const result = loginSchema.safeParse({
      email: "no-es-email",
      password: "secreto123",
    });

    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("rechaza contraseñas que no coinciden", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "ana@email.com",
      password: "secreto123",
      confirmPassword: "otro-secreto",
    });

    expect(result.success).toBe(false);
  });
});
