const env = import.meta.env

/** 应用标题 */
export const APP_TITLE = env.VITE_APP_TITLE || 'uni-app template'

/** 当前运行环境标识：development / production ... */
export const APP_ENV = env.VITE_ENV || env.MODE

/** 是否开发环境 */
export const IS_DEV = Boolean(env.DEV)

/** 接口基础路径 */
export const API_BASE_URL = env.VITE_API_BASE_URL || '/api'

/** 业务成功码（与后端约定，通常为 0 或 200） */
export const API_SUCCESS_CODE = Number(env.VITE_API_SUCCESS_CODE ?? 0)

/** 登录失效码，命中后清除本地 token */
export const API_UNAUTHORIZED_CODE = Number(env.VITE_API_UNAUTHORIZED_CODE ?? 401)

/** 请求超时时间（毫秒） */
export const REQUEST_TIMEOUT = Number(env.VITE_REQUEST_TIMEOUT ?? 15000)

/** 本地存储 key 前缀，避免同域名下多应用互相覆盖 */
export const STORAGE_PREFIX = env.VITE_STORAGE_PREFIX || 'uni_app_'
