import { storage } from './storage'

/** 访问令牌（accessToken），有效期 2 小时 */
export const TOKEN_KEY = 'token'

/** 刷新令牌，有效期 7 天 */
export const REFRESH_TOKEN_KEY = 'refresh_token'

export function getToken(): string {
  return storage.get<string>(TOKEN_KEY, '') || ''
}

export function setToken(token: string): void {
  storage.set(TOKEN_KEY, token)
}

/** 刷新令牌。accessToken 过期时用它去换新的（见 src/utils/request.ts） */
export function getRefreshToken(): string {
  return storage.get<string>(REFRESH_TOKEN_KEY, '') || ''
}

export function setRefreshToken(token: string): void {
  storage.set(REFRESH_TOKEN_KEY, token)
}

/** 两个令牌一起清，避免只清了一半还能拿去刷新 */
export function clearToken(): void {
  storage.remove(TOKEN_KEY)
  storage.remove(REFRESH_TOKEN_KEY)
}

export function isLogged(): boolean {
  return getToken().length > 0
}
