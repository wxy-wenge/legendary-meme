import { get } from '@/utils/request'
import type {
  BannerItem,
  CategoryItem,
  CourseDetail,
  CourseItem,
  CourseQuery,
  TableResult
} from '../types'

/**
 * 内容模块（课程 / 视频 / 文章）。
 *
 * 约定 —— 后端照这个实现即可：
 *   - 列表接口返回**顶层** rows + total（若依统一格式）
 *   - 固定的小列表（轮播、热门搜索词）放在 data 里
 *   - 字段定义见 src/api/types.ts
 */
export const contentApi = {
  /** 首页轮播位 */
  banners: () => get<BannerItem[]>('/content/banners'),

  /**
   * 课程分类列表（后端 learning-course 模块，免登录）。
   * 注意路径不带 /api 前缀 —— /api/** 归 C 端那条安全链管。
   * 返回的是 AjaxResult.data 里的数组。
   */
  categories: () => get<CategoryItem[]>('/course/category/list'),

  /** 课程列表（首页信息流，按分类） */
  courses: (params?: CourseQuery) => get<TableResult<CourseItem>>('/content/courses', params),

  /** 按关键词搜课程 */
  search: (keyword: string) => get<TableResult<CourseItem>>('/content/search', { keyword }),

  /** 热门搜索词 */
  hotSearch: () => get<string[]>('/content/hotSearch'),

  /** 课程详情 */
  detail: (id: number) => get<CourseDetail>('/content/detail', { id })
}
