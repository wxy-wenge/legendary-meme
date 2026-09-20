/**
 * pinia-plugin-persistedstate 在 uni-app 下的存储适配器。
 *
 * 该插件默认使用 localStorage / sessionStorage，这两个对象在小程序与 App 端并不存在，
 * 所以统一改走 uni.getStorageSync / uni.setStorageSync。
 */
export const uniStorage = {
  getItem(key: string): string | null {
    try {
      const value = uni.getStorageSync(key)
      if (value === '' || value === null || value === undefined) return null
      return typeof value === 'string' ? value : JSON.stringify(value)
    } catch {
      return null
    }
  },

  setItem(key: string, value: string): void {
    try {
      uni.setStorageSync(key, value)
    } catch {
      // 存储写失败不应阻断业务
    }
  },

  removeItem(key: string): void {
    try {
      uni.removeStorageSync(key)
    } catch {
      // ignore
    }
  }
}

export default uniStorage
