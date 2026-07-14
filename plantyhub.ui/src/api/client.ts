import { API_URL } from './config'
import { getAdminToken, getCustomerToken } from '../auth/session'

export class ApiError extends Error {
  status: number
  code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
  auth?: 'admin' | 'customer' | 'none'
  headers?: Record<string, string>
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = 'none', headers = {} } = options
  const token = auth === 'admin' ? getAdminToken() : auth === 'customer' ? getCustomerToken() : null

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!res.ok) {
    let message = res.statusText
    let code: string | undefined
    try {
      const data = (await res.json()) as { message?: string; code?: string }
      if (data.message) message = data.message
      code = data.code
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message, code)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
