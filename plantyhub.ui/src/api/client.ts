import { API_URL } from './config'
import { clearAdminSession, clearCustomerSession, getAdminToken, getCustomerToken } from '../auth/session'
import { resolveHref } from '../paths'

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

/** Old JWTs are rejected after a password change. Drop the stored session so the UI logs out. */
function endRejectedSession(status: number, auth: RequestOptions['auth']) {
  if (status !== 401 || !auth || auth === 'none') return
  if (auth === 'admin') {
    clearAdminSession()
    if (window.location.pathname.includes('/admin')) {
      window.location.replace(resolveHref('/login'))
    }
    return
  }
  clearCustomerSession()
  window.dispatchEvent(new Event('plantyhub-session-cleared'))
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
    endRejectedSession(res.status, auth)
    throw new ApiError(res.status, message, code)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function apiBlob(path: string, auth: 'admin' | 'customer' = 'admin'): Promise<Blob> {
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
    endRejectedSession(res.status, auth)
    throw new ApiError(res.status, message)
  }
  return res.blob()
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
    endRejectedSession(res.status, auth)
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

/** Multipart form without auth. Do not set Content-Type — the browser sets the boundary. */
export async function apiForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { method: 'POST', body: form })
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
    endRejectedSession(res.status, auth)
    throw new ApiError(res.status, message, code)
  }

  return (await res.json()) as T
}
