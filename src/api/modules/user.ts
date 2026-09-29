import { get, post } from '@/utils/request'
import type {
  CaptchaResult,
  LoginParams,
  LoginResult,
  RefreshTokenResult,
  RegisterPayload,
  RegisterResult,
  UserInfoResult
} from '../types'

/**
 * C 端用户认证（后端 learning-user 模块，基路径 `/api/user`）。
 *
 * 和若依原版认证的差别，接入时容易踩：
 *   1. 路径带 `/api/user` 前缀 —— 不是 `/login`、`/register`
 *   2. 登录返回的 token 在 **data 里**（LoginVO），若依原版是顶层 token
 *   3. 多了 logout 和 refreshToken：accessToken 2 小时、refreshToken 7 天
 *   4. 注册**必须传 nickname**
 *   5. 验证码仍沿用若依的 `GET /captchaImage`，没有变化
 */
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

  /** 登录（匿名）。返回 data 里的 LoginVO */
  login: (data: LoginParams) => post<LoginResult>('/api/user/login', data, { auth: false }),

  /** 注册（匿名）。后端 RegisterDTO 要求 nickname 必填 */
  register: (data: RegisterPayload) =>
    post<RegisterResult>('/api/user/register', data, { auth: false }),

  /** 登出：让后端把当前 token 加进 Redis 黑名单 */
  logout: () => post<null>('/api/user/logout'),

  /**
   * 用 refreshToken 换新的 accessToken。
   * 注意请求头里带的是 **refreshToken**，不是 accessToken。
   */
  refreshToken: (refreshToken: string) =>
    post<RefreshTokenResult>('/api/user/refreshToken', undefined, {
      auth: false,
      header: { Authorization: `Bearer ${refreshToken}` }
    }),

  /**
   * 当前登录用户信息 / 角色 / 权限（若依原装的接口）。
   *
   * ⚠️ 后端 learning-user 用的是自实现的 JWT，**不在若依的令牌体系里**，
   * 所以若依原装的接口拿这个 token 过去会返回 401。
   * 这里用 silent401 + toast:false：拿不到就当没有角色 / 权限，
   * **绝不能因为它把已经登录成功的用户踢回登录页**。
   */
  getInfo: () => get<UserInfoResult>('/getInfo', undefined, { silent401: true, toast: false })
}
