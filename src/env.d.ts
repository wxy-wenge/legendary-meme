/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_STORAGE_PREFIX: string
  readonly VITE_REQUEST_TIMEOUT: string
  readonly VITE_API_SUCCESS_CODE: string
  readonly VITE_API_UNAUTHORIZED_CODE: string
  readonly VITE_ENV: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_PREFIX: string
  readonly VITE_PROXY_TARGET: string
  readonly VITE_DEV_HOST: string
  readonly VITE_DEV_PORT: string
  readonly VITE_USE_MOCK: string
}
