"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import type { z } from "zod";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface MutationOptions<TData> {
  url: string;
  schema?: z.ZodType<TData>;
  method?: HttpMethod;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  getToken?: () => string | null;
}

export interface ApiMutationOptions<TVariables, TData, TResult = TData> {
  url: string | ((variables: TVariables) => string);
  schema?: z.ZodType<TData>;
  method?: HttpMethod;
  buildBody?: (variables: TVariables) => unknown;
  transform?: (data: TData) => TResult;
  onSuccess?: (data: TResult, variables: TVariables) => void | Promise<void>;
  onError?: (error: Error) => void;
  getToken?: () => string | null;
}

export interface ApiQueryOptions<TData, TSelected = TData> {
  url: string;
  schema: z.ZodType<TData>;
  params?: QueryParams;
  queryKey?: QueryKey;
  select?: (data: TData) => TSelected;
  enabled?: boolean;
  getToken?: () => string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function buildUrl(url: string, params?: QueryParams): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return `${API_URL}${url}${query ? `?${query}` : ""}`;
}

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

interface RequestOptions<TData> {
  method: HttpMethod;
  schema?: z.ZodType<TData>;
  params?: QueryParams;
  body?: unknown;
  getToken?: () => string | null;
}

async function request<TData>(
  url: string,
  {
    method,
    schema,
    params,
    body,
    getToken = defaultToken,
  }: RequestOptions<TData>
): Promise<TData> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(url, params), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as TData;
  }

  const payload: unknown = await response.json();

  if (!schema) {
    return payload as TData;
  }

  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  }

  return parsed.data;
}

export function useApiQuery<TData, TSelected = TData>({
  url,
  schema,
  params,
  queryKey,
  select,
  enabled = true,
  getToken = defaultToken,
}: ApiQueryOptions<TData, TSelected>) {
  return useQuery<TData, Error, TSelected>({
    queryKey: queryKey ?? [url, params ?? null],
    queryFn: () => request(url, { method: "GET", schema, params, getToken }),
    select,
    enabled,
  });
}

export function useApiMutation<TVariables, TData, TResult = TData>({
  url,
  schema,
  method = "POST",
  buildBody,
  transform,
  onSuccess,
  onError,
  getToken = defaultToken,
}: ApiMutationOptions<TVariables, TData, TResult>) {
  return useMutation<TResult, Error, TVariables>({
    mutationFn: async (variables) => {
      const data = await request(
        typeof url === "function" ? url(variables) : url,
        {
          method,
          schema,
          body: buildBody ? buildBody(variables) : variables,
          getToken,
        }
      );

      return transform ? transform(data) : (data as unknown as TResult);
    },
    onSuccess,
    onError,
  });
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
      request(url, {
        method,
        schema,
        body: method === "GET" ? undefined : variables,
        getToken,
      }),
    onSuccess,
    onError,
  });
}
