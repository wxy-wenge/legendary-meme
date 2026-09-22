import { describe, expect, it } from 'vitest'
import { mockRequest } from '@/api/mock'

interface CaptchaBody {
  code: number
  captchaEnabled: boolean
  uuid: string
  mockCode: string
}

interface ResultBody {
  code: number
  msg: string
  token?: string
}

/** 取一张新验证码，返回 uuid 和明文 */
async function newCaptcha(): Promise<{ uuid: string; mockCode: string }> {
  const res = await mockRequest({ url: '/api/captchaImage', method: 'GET' })
  const body = res?.data as CaptchaBody
  return { uuid: body.uuid, mockCode: body.mockCode }
}

describe('mockRequest 路由匹配', () => {
  it('未命中的路径返回 null，好让请求继续走真实接口', async () => {
    expect(await mockRequest({ url: '/api/learninguser/list', method: 'GET' })).toBeNull()
  })

  it('验证码接口返回 uuid 和 4 位明文', async () => {
    const res = await mockRequest({ url: '/api/captchaImage', method: 'GET' })

    expect(res?.statusCode).toBe(200)

    const body = res?.data as CaptchaBody
    expect(body.code).toBe(200)
    expect(body.captchaEnabled).toBe(true)
    expect(body.uuid).toBeTruthy()
    expect(body.mockCode).toHaveLength(4)
  })
})

describe('mockRequest 登录', () => {
  it('验证码和账号密码都正确时返回 token', async () => {
    const { uuid, mockCode } = await newCaptcha()

    const res = await mockRequest({
      url: '/api/login',
      method: 'POST',
      data: { username: 'admin', password: 'admin123', code: mockCode, uuid }
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
      data: { username: 'admin', password: 'admin123', code: 'ZZZZ', uuid }
    })

    expect((res?.data as ResultBody).code).not.toBe(200)
  })

  it('密码错误时失败', async () => {
    const { uuid, mockCode } = await newCaptcha()

    const res = await mockRequest({
      url: '/api/login',
      method: 'POST',
      data: { username: 'admin', password: 'wrong-password', code: mockCode, uuid }
    })

    expect((res?.data as ResultBody).code).not.toBe(200)
  })

  it('同一个验证码不能用第二次', async () => {
    const { uuid, mockCode } = await newCaptcha()
    const payload = { username: 'admin', password: 'admin123', code: mockCode, uuid }

    const first = await mockRequest({ url: '/api/login', method: 'POST', data: payload })
    expect((first?.data as ResultBody).code).toBe(200)

    const second = await mockRequest({ url: '/api/login', method: 'POST', data: payload })
    expect((second?.data as ResultBody).code).not.toBe(200)
  })
})

describe('mockRequest 注册', () => {
  it('重复账号被拒绝', async () => {
    const { uuid, mockCode } = await newCaptcha()

    const res = await mockRequest({
      url: '/api/register',
      method: 'POST',
      data: {
        username: 'admin',
        password: 'admin123',
        confirmPassword: 'admin123',
        code: mockCode,
        uuid
      }
    })

    expect((res?.data as ResultBody).code).not.toBe(200)
  })

  it('新账号可以注册成功', async () => {
    const { uuid, mockCode } = await newCaptcha()

    const res = await mockRequest({
      url: '/api/register',
      method: 'POST',
      data: {
        username: 'newbie',
        password: 'abc123',
        confirmPassword: 'abc123',
        code: mockCode,
        uuid
      }
    })

    expect((res?.data as ResultBody).code).toBe(200)
  })

  it('两次密码不一致时被拒绝', async () => {
    const { uuid, mockCode } = await newCaptcha()

    const res = await mockRequest({
      url: '/api/register',
      method: 'POST',
      data: {
        username: 'other',
        password: 'abc123',
        confirmPassword: 'abc999',
        code: mockCode,
        uuid
      }
    })

    expect((res?.data as ResultBody).code).not.toBe(200)
  })
})
