/**
 * 前端模拟层（临时）
 *
 * 作用：后端接口还没跑起来时，让登录 / 注册流程能完整点通，方便调界面。
 *
 * 打开：.env.development 里 VITE_USE_MOCK=true（默认就是开的）
 * 关闭：改成 false，或删掉这一行
 * 彻底移除：删掉本文件 + src/utils/request.ts 里那段 `USE_MOCK ? await mockRequest(...)`
 *
 * 模拟的是若依（RuoYi 3.9.2）的真实行为，已对照后端源码核对：
 *   - 返回格式 { code, msg, ... }，成功码 200
 *   - 验证码是**数学题**（application.yml 里 captchaType: math）
 *   - 注册的校验顺序和提示语与 SysRegisterService 一致
 */

const SUCCESS = 200
const FAIL = 500

/** 与后端 UserConstants 保持一致 */
const USERNAME_MIN = 2
const USERNAME_MAX = 20
const PASSWORD_MIN = 5
const PASSWORD_MAX = 20

export interface MockResponse {
  statusCode: number
  data: unknown
}

export interface MockRequestOptions {
  /** 已拼好 baseURL 的完整地址 */
  url: string
  method: string
  data?: unknown
}

// ---------- 模拟状态（刷新页面就重置） ----------

/** uuid → 验证码答案 */
const captchaStore = new Map<string, string>()

/** 账号 → 信息。预置一个演示账号 */
const users = new Map<string, { password: string; nickName: string }>([
  ['admin', { password: 'admin123', nickName: '管理员' }]
])

let uuidSeq = 0
let tokenSeq = 0

// ---------- 工具 ----------

function nextUuid(): string {
  uuidSeq += 1
  return `mock-uuid-${Date.now()}-${uuidSeq}`
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function body(data: Record<string, unknown>): MockResponse {
  return { statusCode: 200, data: { code: SUCCESS, msg: '操作成功', ...data } }
}

function error(msg: string, code = FAIL): MockResponse {
  return { statusCode: 200, data: { code, msg } }
}

function asRecord(data: unknown): Record<string, unknown> {
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
}

function str(data: Record<string, unknown>, key: string): string {
  const v = data[key]
  return v === undefined || v === null ? '' : String(v).trim()
}

/**
 * 生成数学验证码，规则照抄后端的 KaptchaTextCreator：
 * 随机两个 0-9 的数，随机做 * / + -，返回「算式」和「答案」。
 */
function makeMathCaptcha(): { text: string; answer: string } {
  const x = Math.floor(Math.random() * 10)
  const y = Math.floor(Math.random() * 10)
  const operands = Math.floor(Math.random() * 3)

  let answer: number
  let text: string

  if (operands === 0) {
    answer = x * y
    text = `${x}*${y}`
  } else if (operands === 1) {
    if (x !== 0 && y % x === 0) {
      answer = y / x
      text = `${y}/${x}`
    } else {
      answer = x + y
      text = `${x}+${y}`
    }
  } else if (x >= y) {
    answer = x - y
    text = `${x}-${y}`
  } else {
    answer = y - x
    text = `${y}-${x}`
  }

  return { text: `${text}=?`, answer: String(answer) }
}

// ---------- 各接口的模拟实现 ----------

function mockCaptcha(): MockResponse {
  const uuid = nextUuid()
  const { text, answer } = makeMathCaptcha()
  captchaStore.set(uuid, answer)

  return body({
    captchaEnabled: true,
    uuid,
    // 真实若依返回 base64 图片；模拟层返回空 img + 算式文本，
    // 页面在没有 img 时会把算式当文字验证码显示，
    // 这样不依赖各端对 base64 图片的支持差异。
    img: '',
    mockText: text
  })
}

function mockLogin(raw: unknown): MockResponse {
  const data = asRecord(raw)
  const username = str(data, 'username')
  const password = str(data, 'password')
  const code = str(data, 'code')
  const uuid = str(data, 'uuid')

  const expected = captchaStore.get(uuid)
  if (expected === undefined) return error('验证码已失效，请刷新后重试')
  captchaStore.delete(uuid) // 验证码一次性
  if (code !== expected) return error('验证码错误')

  const user = users.get(username)
  if (!user || user.password !== password) return error('用户名或密码错误')

  tokenSeq += 1
  return body({ token: `mock-token-${tokenSeq}` })
}

function mockRegister(raw: unknown): MockResponse {
  const data = asRecord(raw)
  const username = str(data, 'username')
  const password = str(data, 'password')
  const code = str(data, 'code')
  const uuid = str(data, 'uuid')

  // 校验顺序与 SysRegisterService 保持一致
  const expected = captchaStore.get(uuid)
  if (expected === undefined) return error('验证码已失效，请刷新后重试')
  captchaStore.delete(uuid)
  if (code !== expected) return error('验证码错误')

  if (!username) return error('用户名不能为空')
  if (!password) return error('用户密码不能为空')
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return error(`账户长度必须在${USERNAME_MIN}到${USERNAME_MAX}个字符之间`)
  }
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return error(`密码长度必须在${PASSWORD_MIN}到${PASSWORD_MAX}个字符之间`)
  }
  if (users.has(username)) return error(`保存用户'${username}'失败，注册账号已存在`)

  users.set(username, { password, nickName: username })
  return body({})
}

function mockGetInfo(): MockResponse {
  return body({
    user: {
      userId: 1,
      userName: 'admin',
      nickName: '管理员',
      avatar: ''
    },
    roles: ['admin'],
    permissions: ['*:*:*']
  })
}

// ---------- 对外入口 ----------

/**
 * 命中模拟路由则返回响应，否则返回 null（调用方继续走真实请求）。
 */
export async function mockRequest(options: MockRequestOptions): Promise<MockResponse | null> {
  const path = options.url.split('?')[0]
  const method = options.method.toUpperCase()

  // 模拟一点网络延迟，方便看清 loading 状态
  await delay(300)

  if (method === 'GET' && path.endsWith('/captchaImage')) return mockCaptcha()
  if (method === 'POST' && path.endsWith('/login')) return mockLogin(options.data)
  if (method === 'POST' && path.endsWith('/register')) return mockRegister(options.data)
  if (method === 'GET' && path.endsWith('/getInfo')) return mockGetInfo()

  return null
}
