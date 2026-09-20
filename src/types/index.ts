/** 通用工具类型 */

export type Nullable<T> = T | null

export interface PageQuery {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface Option<T = string> {
  label: string
  value: T
}
