import { get, post } from '@/utils/request'
import type {
  CaptchaResult,
  LoginParams,
  LoginResult,
  RegisterParams,
  UserInfoResult
} from '../types'

export const userApi = {
  /**
   * 获取登录 / 注册验证码（匿名）。
   * 若依返回的 img 是**裸 base64**（ImageIO 写出的 jpg），没有 data URI 前缀，
   * 直接给 <image> 用不会显示，这里统一补成完整的 data URI。
   */
  getCaptcha: async (): Promise<CaptchaResult> => {
    const res = await get<CaptchaResult>('/captchaImage', undefined, { auth: false })
    const img = res.img
    return {
      ...res,
      img: img && !img.startsWith('data:') ? `data:image/jpeg;base64,${img}` : img
    }
  },

  /** 登录（匿名，token 在返回顶层） */
  login: (data: LoginParams) => post<LoginResult>('/login', data, { auth: false }),

  /**
   * 注册（匿名，同样需要验证码）。
   * 注意：后端受配置项 sys.account.registerUser 控制，默认是 false（关闭），
   * 没打开时会直接返回「当前系统没有开启注册功能！」。
   */
  register: (data: RegisterParams) => post<null>('/register', data, { auth: false }),

  /** 获取当前登录用户信息 / 角色 / 权限 */
  getInfo: () => get<UserInfoResult>('/getInfo')
}
