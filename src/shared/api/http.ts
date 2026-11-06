import type { z } from "zod"

export const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000"

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

  const response = await fetch(`${API_URL}${url}`, {
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
