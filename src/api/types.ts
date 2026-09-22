/** 与若依后端约定的领域模型，按业务模块继续往下加即可 */

// ---------- 认证 ----------

/** 登录参数（若依 POST /login：用户名 + 密码 + 验证码 + uuid） */
export interface LoginParams {
  username: string
  password: string
  /** 验证码（后端开启验证码时必填） */
  code?: string
  /** 验证码对应的 uuid（来自 GET /captchaImage） */
  uuid?: string
}

/** 注册参数（若依 POST /register：比登录多一个确认密码） */
export interface RegisterParams extends LoginParams {
  confirmPassword: string
}

/** 验证码返回（GET /captchaImage） */
export interface CaptchaResult {
  /** 是否开启验证码；false 时前端可隐藏验证码输入框 */
  captchaEnabled: boolean
  uuid?: string
  /** base64 图片（data:image/...;base64,xxxx），开启验证码时用于 <image> 显示 */
  img?: string
  /**
   * 仅前端模拟层返回（见 src/api/mock.ts）：验证码明文。
   * 后端不会返回这个字段，接入真实接口后自动失效。
   */
  mockCode?: string
}

/** 登录返回（POST /login，token 在响应顶层，不在 data 里） */
export interface LoginResult {
  token: string
}

/** 用户信息（GET /getInfo 返回顶层的 user 字段） */
export interface UserInfo {
  userId: number
  userName: string
  nickName: string
  avatar?: string
  phonenumber?: string
  email?: string
  dept?: { deptId: number; deptName: string }
  [key: string]: unknown
}

/** GET /getInfo 返回（user / roles / permissions 均在响应顶层） */
export interface UserInfoResult {
  user: UserInfo
  roles: string[]
  permissions: string[]
}

// ---------- 通用 ----------

/** 若依列表接口统一返回：rows（当前页数据）+ total（总数），均在响应顶层 */
export interface TableResult<T> {
  rows: T[]
  total: number
}

// ---------- 业务：学习用户 learninguser ----------

/**
 * 学习用户实体。
 * 字段需与后端 com.ruoyi.learninguser.entity 的实体类保持一致，按实际表结构补充。
 */
export interface LearningUser {
  id: number
  // TODO: 按后端实体补充字段，例如：
  // name: string
  // createTime: string
  [key: string]: unknown
}
