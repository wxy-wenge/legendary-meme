/**
 * 前端模拟层（临时）
 *
 * 作用：后端接口还没跑起来时，让登录 / 注册流程能完整点通，方便调界面。
 *
 * 打开：.env.development 里 VITE_USE_MOCK=true（默认就是开的）
 * 关闭：改成 false，或删掉这一行
 * 彻底移除：删掉本文件 + src/utils/request.ts 里那段 `USE_MOCK ? await mockRequest(...)`
 *
 * 模拟的是若依（RuoYi）的返回格式：{ code, msg, ... }，成功码 200。
 */

const SUCCESS = 200
const FAIL = 500

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

/** uuid → 验证码明文 */
const captchaStore = new Map<string, string>()

/** 账号 → 信息。预置一个演示账号 */
const users = new Map<string, { password: string; nickName: string }>([
  ['admin', { password: 'admin123', nickName: '管理员' }]
])

let uuidSeq = 0
let tokenSeq = 0

// ---------- 工具 ----------

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXY3456789'

function randomCode(length = 4): string {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return out
}

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
  return v === undefined || v === null ? '' : String(v)
}

// ---------- 各接口的模拟实现 ----------

function mockCaptcha(): MockResponse {
  const uuid = nextUuid()
  const code = randomCode()
  captchaStore.set(uuid, code)
  return body({
    captchaEnabled: true,
    uuid,
    // 真实若依返回的是 base64 图片；模拟层返回空 img + 明文，
    // 页面会把明文当文字验证码显示，避免依赖各端对 base64 图片的支持差异。
    img: '',
    mockCode: code
  })
}

function mockLogin(raw: unknown): MockResponse {
  const data = asRecord(raw)
  const username = str(data, 'username')
  const password = str(data, 'password')
  const code = str(data, 'code')
  const uuid = str(data, 'uuid')

  const expected = captchaStore.get(uuid)
  if (!expected) return error('验证码已失效，请刷新后重试')
  captchaStore.delete(uuid) // 验证码一次性
  if (code.toUpperCase() !== expected.toUpperCase()) return error('验证码错误')

  const user = users.get(username)
  if (!user || user.password !== password) return error('用户名或密码错误')

  tokenSeq += 1
  return body({ token: `mock-token-${tokenSeq}` })
}

function mockRegister(raw: unknown): MockResponse {
  const data = asRecord(raw)
  const username = str(data, 'username')
  const password = str(data, 'password')
  const confirmPassword = str(data, 'confirmPassword')
  const code = str(data, 'code')
  const uuid = str(data, 'uuid')

  const expected = captchaStore.get(uuid)
  if (!expected) return error('验证码已失效，请刷新后重试')
  captchaStore.delete(uuid)
  if (code.toUpperCase() !== expected.toUpperCase()) return error('验证码错误')

  if (password !== confirmPassword) return error('两次输入的密码不一致')
  if (users.has(username)) return error('用户名已存在')
  if (password.length < 5) return error('密码长度必须在 5 到 20 个字符之间')

  users.set(username, { password, nickName: username })
  return body({})
}

function mockGetInfo(): MockResponse {
  // 模拟层只认自己发出去的 token
  return body({
    user: {
      userId: 1,
      userName: 'admin',
      nickName: '管理员',
      avatar: '',
      roles: ['admin']
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
