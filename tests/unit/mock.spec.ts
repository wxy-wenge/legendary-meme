import { describe, expect, it } from 'vitest'
import { mockRequest } from '@/api/mock'

interface CaptchaBody {
  code: number
  captchaEnabled: boolean
  uuid: string
  mockText: string
}

interface ResultBody {
  code: number
  msg: string
  token?: string
}

/** 把 `3+5=?` 这样的算式解出来，顺便验证模拟层生成的算式本身是对的 */
function solve(text: string): string {
  const matched = /^(\d+)([*/+-])(\d+)=\?$/.exec(text)
  if (!matched) throw new Error(`验证码格式不对: ${text}`)

  const a = Number(matched[1])
  const b = Number(matched[3])
  switch (matched[2]) {
    case '*':
      return String(a * b)
    case '/':
      return String(a / b)
    case '+':
      return String(a + b)
    default:
      return String(a - b)
  }
}

/** 取一张新验证码，返回 uuid 和正确答案 */
async function newCaptcha(): Promise<{ uuid: string; code: string; text: string }> {
  const res = await mockRequest({ url: '/api/captchaImage', method: 'GET' })
  const body = res?.data as CaptchaBody
  return { uuid: body.uuid, code: solve(body.mockText), text: body.mockText }
}

describe('mockRequest 路由匹配', () => {
  it('未命中的路径返回 null，好让请求继续走真实接口', async () => {
    expect(await mockRequest({ url: '/api/learninguser/list', method: 'GET' })).toBeNull()
  })

  it('验证码接口返回 uuid 和数学算式（对齐后端 captchaType=math）', async () => {
    const res = await mockRequest({ url: '/api/captchaImage', method: 'GET' })

    expect(res?.statusCode).toBe(200)

    const body = res?.data as CaptchaBody
    expect(body.code).toBe(200)
    expect(body.captchaEnabled).toBe(true)
    expect(body.uuid).toBeTruthy()
    expect(body.mockText).toMatch(/^\d+[*/+-]\d+=\?$/)
  })
})

describe('mockRequest 登录', () => {
  it('验证码和账号密码都正确时返回 token', async () => {
    const { uuid, code } = await newCaptcha()

    const res = await mockRequest({
      url: '/api/login',
      method: 'POST',
      data: { username: 'admin', password: 'admin123', code, uuid }
    })

    const body = res?.data as ResultBody
    expect(body.code).toBe(200)
    expect(body.token).toBeTruthy()
  })

  it('验证码错误时失败', async () => {
    const { uuid } = await newCaptcha()

    const res = await mockRequest({
      url: '/api/login',
      method: 'POST',
      data: { username: 'admin', password: 'admin123', code: '9999', uuid }
    })

    expect((res?.data as ResultBody).code).not.toBe(200)
  })

  it('密码错误时失败', async () => {
    const { uuid, code } = await newCaptcha()

    const res = await mockRequest({
      url: '/api/login',
      method: 'POST',
      data: { username: 'admin', password: 'wrong-password', code, uuid }
    })

    expect((res?.data as ResultBody).code).not.toBe(200)
  })

  it('同一个验证码不能用第二次', async () => {
    const { uuid, code } = await newCaptcha()
    const payload = { username: 'admin', password: 'admin123', code, uuid }

    const first = await mockRequest({ url: '/api/login', method: 'POST', data: payload })
    expect((first?.data as ResultBody).code).toBe(200)

    const second = await mockRequest({ url: '/api/login', method: 'POST', data: payload })
    expect((second?.data as ResultBody).code).not.toBe(200)
  })
})

describe('mockRequest 注册', () => {
  it('重复账号被拒绝', async () => {
    const { uuid, code } = await newCaptcha()

    const res = await mockRequest({
      url: '/api/register',
      method: 'POST',
      data: { username: 'admin', password: 'admin123', confirmPassword: 'admin123', code, uuid }
    })

    expect((res?.data as ResultBody).code).not.toBe(200)
  })

  it('新账号可以注册成功', async () => {
    const { uuid, code } = await newCaptcha()

    const res = await mockRequest({
      url: '/api/register',
      method: 'POST',
      data: { username: 'newbie', password: 'abc123', confirmPassword: 'abc123', code, uuid }
    })

    expect((res?.data as ResultBody).code).toBe(200)
  })

  it('密码太短被拒绝（后端规则：5-20）', async () => {
    const { uuid, code } = await newCaptcha()

    const res = await mockRequest({
      url: '/api/register',
      method: 'POST',
      data: { username: 'shorty', password: 'abc', confirmPassword: 'abc', code, uuid }
    })

    expect((res?.data as ResultBody).code).not.toBe(200)
  })

  it('账号太短被拒绝（后端规则：2-20）', async () => {
    const { uuid, code } = await newCaptcha()

    const res = await mockRequest({
      url: '/api/register',
      method: 'POST',
      data: { username: 'a', password: 'abc123', confirmPassword: 'abc123', code, uuid }
    })

    expect((res?.data as ResultBody).code).not.toBe(200)
  })
})
