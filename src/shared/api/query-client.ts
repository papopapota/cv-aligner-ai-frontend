"use client";

import { useMutation } from "@tanstack/react-query";
import type { z } from "zod";

export interface MutationOptions<TData> {
  url: string;
  schema: z.ZodType<TData>;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  getToken?: () => string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readErrorMessage(response: Response): Promise<string> {
  const payload: unknown = await response.json().catch(() => null);

  if (isRecord(payload)) {
    const detail = payload.detail;
    const message = payload.message;

    if (typeof detail === "string" && detail.length > 0) {
      return detail;
    }

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return `Error HTTP ${response.status}`;
}

function defaultToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem("access_token");
}

async function executeMutation<TData>(
  url: string,
  method: NonNullable<MutationOptions<TData>["method"]>,
  variables: unknown,
  schema: z.ZodType<TData>,
  getToken: () => string | null
): Promise<TData> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    method,
    headers,
    body: method === "GET" ? undefined : JSON.stringify(variables),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload: unknown = await response.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  }

  return parsed.data;
}

export function useCreateMutation<TVariables, TData>({
  url,
  schema,
  method = "POST",
  onSuccess,
  onError,
  getToken = defaultToken,
}: MutationOptions<TData>) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) =>
      executeMutation(url, method, variables, schema, getToken),
    onSuccess,
    onError,
  });
}
