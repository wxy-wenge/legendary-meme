import { get, post } from '@/utils/request'
import type { CaptchaResult, LoginParams, LoginResult, UserInfoResult } from '../types'

export const userApi = {
  /** 获取登录验证码（匿名） */
  getCaptcha: () => get<CaptchaResult>('/captchaImage', undefined, { auth: false }),

  /** 登录（匿名，token 在返回顶层） */
  login: (data: LoginParams) => post<LoginResult>('/login', data, { auth: false }),

  /** 获取当前登录用户信息 / 角色 / 权限 */
  getInfo: () => get<UserInfoResult>('/getInfo')
}
