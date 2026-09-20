import { get, post, put } from '@/utils/request'
import type { LoginParams, LoginResult, UserInfo } from '../types'

export const userApi = {
  /** 登录接口不需要带旧 token */
  login: (data: LoginParams) => post<LoginResult>('/auth/login', data, { auth: false }),

  logout: () => post<null>('/auth/logout'),

  getProfile: () => get<UserInfo>('/user/profile'),

  updateProfile: (data: Partial<UserInfo>) => put<UserInfo>('/user/profile', data)
}
