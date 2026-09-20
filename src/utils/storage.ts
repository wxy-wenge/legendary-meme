import { STORAGE_PREFIX } from '@/config'

function withPrefix(key: string): string {
  return key.startsWith(STORAGE_PREFIX) ? key : `${STORAGE_PREFIX}${key}`
}

/**
 * 基于 uni.getStorageSync 的轻量封装。
 *
 * 统一做两件事：
 * 1. 加 key 前缀，避免多应用串数据；
 * 2. JSON 序列化，让 H5(localStorage 只能存字符串) 与小程序/App 行为一致。
 */
export const storage = {
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const raw = uni.getStorageSync(withPrefix(key))
      if (raw === '' || raw === null || raw === undefined) return defaultValue
      if (typeof raw === 'string') return JSON.parse(raw) as T
      return raw as T
    } catch {
      return defaultValue
    }
  },

  set(key: string, value: unknown): void {
    try {
      uni.setStorageSync(withPrefix(key), JSON.stringify(value))
    } catch {
      // 存储写失败（如超出配额）不应中断业务流程
    }
  },

  remove(key: string): void {
    try {
      uni.removeStorageSync(withPrefix(key))
    } catch {
      // ignore
    }
  },

  clear(): void {
    try {
      uni.clearStorageSync()
    } catch {
      // ignore
    }
  }
}

export default storage
