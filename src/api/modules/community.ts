import { get, post } from '@/utils/request'
import type { PostComment, PostCreateParams, PostDetail, PostItem, TableResult } from '../types'

/**
 * 社区模块（帖子 / 评论 / 点赞 / 收藏）。
 *
 * 约定 —— 后端照这个实现即可：
 *   - 列表返回顶层 rows + total，单个对象放 data
 *   - 点赞 / 收藏把**目标状态**传给后端，由后端决定写入还是取消
 *   - 字段定义见 src/api/types.ts
 */
export const communityApi = {
  /** 帖子列表，topic 为空表示全部 */
  postList: (topic?: string) => get<TableResult<PostItem>>('/community/post/list', { topic }),

  /** 我发布的帖子 */
  myPosts: () => get<TableResult<PostItem>>('/community/post/mine'),

  /** 帖子详情 */
  postDetail: (id: number) => get<PostDetail>('/community/post/detail', { id }),

  /** 发帖，返回新帖子的 id */
  createPost: (data: PostCreateParams) => post<{ id: number }>('/community/post/create', data),

  /** 评论列表 */
  postComments: (postId: number) =>
    get<TableResult<PostComment>>('/community/post/comments', { postId }),

  /** 发评论，返回新评论 */
  addComment: (postId: number, content: string) =>
    post<PostComment>('/community/post/comment', { postId, content }),

  /** 点赞 / 取消点赞，liked 是目标状态 */
  like: (postId: number, liked: boolean) => post<null>('/community/post/like', { postId, liked }),

  /** 收藏 / 取消收藏，favorited 是目标状态 */
  favorite: (postId: number, favorited: boolean) =>
    post<null>('/community/post/favorite', { postId, favorited })
}
