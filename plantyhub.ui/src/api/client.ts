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

/** Binary download with admin/customer auth. Triggers a file save. */
export async function apiDownload(path: string, auth: 'admin' | 'customer' = 'admin'): Promise<void> {
  const token = auth === 'admin' ? getAdminToken() : getCustomerToken()
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const data = (await res.json()) as { message?: string }
      if (data.message) message = data.message
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message)
  }

  const blob = await res.blob()
  const header = res.headers.get('content-disposition') ?? ''
  const star = header.match(/filename\*=UTF-8''([^;]+)/i)
  const quoted = header.match(/filename="([^"]+)"/i)
  const plain = header.match(/filename=([^;]+)/i)
  const filename = decodeURIComponent(star?.[1] ?? quoted?.[1] ?? plain?.[1]?.trim() ?? 'report.bin')

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** Multipart upload (do not set Content-Type — browser sets boundary). */
export async function apiUpload<T>(path: string, file: File, auth: 'admin' | 'customer' = 'admin'): Promise<T> {
  const token = auth === 'admin' ? getAdminToken() : getCustomerToken()
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
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

  return (await res.json()) as T
}
