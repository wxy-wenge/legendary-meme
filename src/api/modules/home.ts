import { get } from '@/utils/request'
import type { Article, Banner } from '../types'

export interface ArticleQuery {
  page?: number
  pageSize?: number
}

export const homeApi = {
  getBanners: () => get<Banner[]>('/home/banners'),

  getArticles: (params?: ArticleQuery) => get<Article[]>('/home/articles', params)
}
