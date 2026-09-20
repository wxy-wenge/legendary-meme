import { API_BASE_URL, API_SUCCESS_CODE, API_UNAUTHORIZED_CODE, REQUEST_TIMEOUT } from '@/config'
import { clearToken, getToken } from './auth'

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface RequestConfig {
  url: string
  method?: HttpMethod
  data?: unknown
  header?: Record<string, string>
  timeout?: number
  /** 是否自动携带 Authorization 头，默认 true */
  auth?: boolean
  /** 是否展示全局 loading，默认 false */
  loading?: boolean
  /** 失败时是否自动 toast，默认 true */
  toast?: boolean
  /** 直接返回响应体、跳过业务 code 校验，默认 false */
  raw?: boolean
}

export class RequestError extends Error {
  readonly code: number
  readonly data: unknown

  constructor(message: string, code = -1, data: unknown = null) {
    super(message)
    this.name = 'RequestError'
    this.code = code
    this.data = data
  }
}

/** 直接复用官方类型，避免手写 UniApp 命名空间里容易过期的结构 */
type UniRequestOptions = Parameters<typeof uni.request>[0]
type UniRequestSuccess = Parameters<NonNullable<UniRequestOptions['success']>>[0]

const ABSOLUTE_URL = /^https?:\/\//i

/** loading 是全局单例，用计数器避免并发请求互相 hide */
let loadingCount = 0

function openLoading(title: string): void {
  loadingCount += 1
  if (loadingCount === 1) uni.showLoading({ title, mask: true })
}

function closeLoading(): void {
  loadingCount = Math.max(0, loadingCount - 1)
  if (loadingCount === 0) uni.hideLoading()
}

export function buildUrl(url: string): string {
  if (ABSOLUTE_URL.test(url)) return url
  const base = API_BASE_URL.replace(/\/+$/, '')
  const path = url.startsWith('/') ? url : `/${url}`
  return `${base}${path}`
}

function normalizeError(err: unknown): RequestError {
  if (err instanceof RequestError) return err

  if (err && typeof err === 'object' && 'errMsg' in err) {
    return new RequestError(String((err as { errMsg: unknown }).errMsg), -1, err)
  }

  if (err instanceof Error) return new RequestError(err.message, -1, err)

  return new RequestError('网络异常，请稍后重试', -1, err)
}

function handleUnauthorized(): void {
  clearToken()
  uni.showToast({ title: '登录状态已过期，请重新登录', icon: 'none' })
  // TODO: 项目接入登录页后，在这里 reLaunch 到登录页
}

export async function request<T = unknown>(config: RequestConfig): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    header,
    timeout = REQUEST_TIMEOUT,
    auth = true,
    loading = false,
    toast = true,
    raw = false
  } = config

  const finalHeader: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header
  }

  if (auth) {
    const token = getToken()
    if (token) finalHeader.Authorization = `Bearer ${token}`
  }

  if (loading) openLoading('加载中...')

  try {
    const res = await new Promise<UniRequestSuccess>((resolve, reject) => {
      uni.request({
        url: buildUrl(url),
        method,
        data: data as UniRequestOptions['data'],
        header: finalHeader,
        timeout,
        success: resolve,
        fail: reject
      })
    })

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw new RequestError(`请求失败（HTTP ${res.statusCode}）`, res.statusCode, res.data)
    }

    const body = res.data as unknown as ApiResponse<T> | T

    // 非标准响应体（如第三方接口）按原样返回
    if (raw || !body || typeof body !== 'object' || !('code' in body)) {
      return body as T
    }

    const result = body as ApiResponse<T>

    if (result.code === API_SUCCESS_CODE) return result.data
    if (result.code === API_UNAUTHORIZED_CODE) handleUnauthorized()

    throw new RequestError(result.message || '请求失败', result.code, result.data)
  } catch (err) {
    const error = normalizeError(err)
    if (toast) uni.showToast({ title: error.message, icon: 'none' })
    throw error
  } finally {
    if (loading) closeLoading()
  }
}

type ExtraConfig = Omit<RequestConfig, 'url' | 'method' | 'data'>

export function get<T = unknown>(url: string, params?: unknown, config?: ExtraConfig): Promise<T> {
  return request<T>({ ...config, url, method: 'GET', data: params })
}

export function post<T = unknown>(url: string, data?: unknown, config?: ExtraConfig): Promise<T> {
  return request<T>({ ...config, url, method: 'POST', data })
}

export function put<T = unknown>(url: string, data?: unknown, config?: ExtraConfig): Promise<T> {
  return request<T>({ ...config, url, method: 'PUT', data })
}

export function del<T = unknown>(url: string, data?: unknown, config?: ExtraConfig): Promise<T> {
  return request<T>({ ...config, url, method: 'DELETE', data })
}

export const http = { request, get, post, put, del }

export default http
