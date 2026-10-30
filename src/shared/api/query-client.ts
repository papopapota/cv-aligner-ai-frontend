
"use client";

import { useMutation } from "@tanstack/react-query";

export interface MutationOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function executeMutation(
  url: string,
  method: string,
  variables: unknown
) {
  const response = await fetch(`${API_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: method === "GET" ? undefined : JSON.stringify(variables),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail ||
      errorData.message ||
      `Error HTTP ${response.status}`
    );
  }

  return response.json();
}

export function createMutation(options: MutationOptions) {
  const {
    url,
    method = "POST",
    onSuccess,
    onError,
  } = options;

  return useMutation({
    mutationFn: (variables: unknown) =>
      executeMutation(url, method, variables),

    onSuccess: (data) => {
      onSuccess?.(data);
    },

    onError: (error) => {
      onError?.(error);
    },
  });
}
