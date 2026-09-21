import { del, get, post, put } from '@/utils/request'
import type { LearningUser, TableResult } from '../types'

export interface LearningUserQuery {
  pageNum?: number
  pageSize?: number
  // TODO: 按后端查询条件补充，例如 name / phone 等
  [key: string]: unknown
}

/**
 * 学习用户模块接口。
 * 路径需与后端 com.ruoyi.learninguser.controller 的 @RequestMapping 保持一致。
 */
export const learningUserApi = {
  /** 分页列表：rows/total 在响应顶层 */
  list: (params?: LearningUserQuery) =>
    get<TableResult<LearningUser>>('/learninguser/list', params),

  /** 详情：单个对象在 data */
  getById: (id: number) => get<LearningUser>(`/learninguser/${id}`),

  add: (data: LearningUser) => post<null>('/learninguser', data),

  update: (data: LearningUser) => put<null>('/learninguser', data),

  remove: (ids: number | number[]) =>
    del<null>(`/learninguser/${Array.isArray(ids) ? ids.join(',') : ids}`)
}
