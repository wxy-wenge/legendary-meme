import { storage } from './storage'

export const TOKEN_KEY = 'token'

export function getToken(): string {
  return storage.get<string>(TOKEN_KEY, '') || ''
}

export function setToken(token: string): void {
  storage.set(TOKEN_KEY, token)
}

export function clearToken(): void {
  storage.remove(TOKEN_KEY)
}

export function isLogged(): boolean {
  return getToken().length > 0
}
