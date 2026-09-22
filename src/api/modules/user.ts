import { get, post } from '@/utils/request'
import type {
  CaptchaResult,
  LoginParams,
  LoginResult,
  RegisterParams,
  UserInfoResult
} from '../types'

export const userApi = {
  /** 获取登录 / 注册验证码（匿名） */
  getCaptcha: () => get<CaptchaResult>('/captchaImage', undefined, { auth: false }),

  /** 登录（匿名，token 在返回顶层） */
  login: (data: LoginParams) => post<LoginResult>('/login', data, { auth: false }),

  /** 注册（匿名，同样需要验证码；后端可在配置里关闭注册开关） */
  register: (data: RegisterParams) => post<null>('/register', data, { auth: false }),

  /** 获取当前登录用户信息 / 角色 / 权限 */
  getInfo: () => get<UserInfoResult>('/getInfo')
}
