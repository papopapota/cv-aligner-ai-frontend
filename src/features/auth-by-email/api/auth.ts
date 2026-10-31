import { z } from "zod";

import { useCreateMutation } from "@/shared/api/query-client";
import type { LoginFormData, RegisterFormData } from "../model";

export const loginResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string().optional(),
});

export const registerResponseSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
  })
  .passthrough();

export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type RegisterPayload = Omit<RegisterFormData, "confirmPassword">;

export function useLoginMutation() {
  return useCreateMutation<LoginFormData, LoginResponse>({
    url: "/auth/login",
    method: "POST",
    schema: loginResponseSchema,
    onSuccess: (data) => {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("access_token", data.access_token);
      }
    },
  });
}

export function useRegisterMutation() {
  return useCreateMutation<RegisterPayload, RegisterResponse>({
    url: "/auth/register",
    method: "POST",
    schema: registerResponseSchema,
  });
}
