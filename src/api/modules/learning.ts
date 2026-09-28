import { get } from '@/utils/request'
import type { CoverItem, LearnHistoryItem, TableResult } from '../types'

/**
 * 学习记录模块：观看历史 / 收藏 / 书架。
 * 三个都是列表，按若依统一格式返回顶层的 rows + total。
 */
export const learningApi = {
  /** 观看 / 阅读历史 */
  history: () => get<TableResult<LearnHistoryItem>>('/learning/history'),

  /** 收藏的视频 */
  favorites: () => get<TableResult<CoverItem>>('/learning/favorites'),

  /** 书架里的书 */
  shelf: () => get<TableResult<CoverItem>>('/learning/shelf')
}
