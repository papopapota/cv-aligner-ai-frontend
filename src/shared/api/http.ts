import type { z } from "zod"

export const API_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000"

export const API_PREFIX = "/api/v1"

export const API_URL = API_ORIGIN.endsWith(API_PREFIX)
  ? API_ORIGIN
  : `${API_ORIGIN.replace(/\/+$/, "")}${API_PREFIX}`

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export async function readErrorMessage(response: Response): Promise<string> {
  const payload: unknown = await response.json().catch(() => null)

  if (isRecord(payload)) {
    const detail = payload.detail
    const message = payload.message

    if (typeof detail === "string" && detail.length > 0) {
      return detail
    }

    if (typeof message === "string" && message.length > 0) {
      return message
    }
  }

  return `Error HTTP ${response.status}`
}

export function defaultToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  return window.sessionStorage.getItem("access_token")
}

interface FormDataRequestOptions<TData> {
  url: string
  formData: FormData
  schema: z.ZodType<TData>
  getToken?: () => string | null
}

export async function postFormData<TData>({
  url,
  formData,
  schema,
  getToken = defaultToken,
}: FormDataRequestOptions<TData>): Promise<TData> {
  const token = getToken()
  const headers: HeadersInit = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const endpoint = url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  const payload: unknown = await response.json()
  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    throw new Error("La respuesta del servidor no tiene el formato esperado.")
  }

  return parsed.data
}

interface JsonRequestOptions<TData> {
  url: string
  body?: unknown
  schema: z.ZodType<TData>
  getToken?: () => string | null
}

export async function postJson<TData>({
  url,
  body,
  schema,
  getToken = defaultToken,
}: JsonRequestOptions<TData>): Promise<TData> {
  const token = getToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const endpoint = url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  const payload: unknown = await response.json()
  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    throw new Error("La respuesta del servidor no tiene el formato esperado.")
  }

  return parsed.data
}

export async function getJson<TData>({
  url,
  schema,
  getToken = defaultToken,
}: Omit<JsonRequestOptions<TData>, "body">): Promise<TData> {
  const token = getToken()
  const headers: HeadersInit = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const endpoint = url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`

  const response = await fetch(endpoint, {
    method: "GET",
    headers,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  const payload: unknown = await response.json()
  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    throw new Error("La respuesta del servidor no tiene el formato esperado.")
  }

  return parsed.data
}
