import { beforeEach, vi } from 'vitest'

export interface UniRequestSuccess {
  statusCode: number
  data: unknown
  header?: Record<string, string>
}

export interface UniRequestFail {
  errMsg: string
}

export interface UniRequestOptions {
  url: string
  method?: string
  data?: unknown
  header?: Record<string, string>
  timeout?: number
  success?: (res: UniRequestSuccess) => void
  fail?: (err: UniRequestFail) => void
}

const storageMap: Record<string, unknown> = {}

/**
 * uni API 的最小替身。
 * 只实现测试用得到的部分，行为与真机保持一致（尤其 getStorageSync 空值返回 ''）。
 */
export const uniMock = {
  request: vi.fn((_options: UniRequestOptions) => ({ abort: vi.fn() })),

  getStorageSync: vi.fn((key: string) => storageMap[key] ?? ''),
  setStorageSync: vi.fn((key: string, value: unknown) => {
    storageMap[key] = value
  }),
  removeStorageSync: vi.fn((key: string) => {
    delete storageMap[key]
  }),
  clearStorageSync: vi.fn(() => {
    for (const key of Object.keys(storageMap)) delete storageMap[key]
  }),

  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  showToast: vi.fn(),
  navigateTo: vi.fn(),
  reLaunch: vi.fn(),
  getSystemInfoSync: vi.fn(() => ({
    platform: 'devtools',
    theme: 'light',
    statusBarHeight: 20
  }))
}

;(globalThis as unknown as { uni: typeof uniMock }).uni = uniMock

beforeEach(() => {
  uniMock.clearStorageSync()
  vi.clearAllMocks()
})
