import { beforeEach, describe, expect, it, vi } from 'vitest'
import { uniMock, type UniRequestOptions } from '../setup'
import { RequestError, buildUrl, get, post } from '@/utils/request'
import { clearToken, getToken, setToken } from '@/utils/auth'

/** 让下一次 uni.request 同步返回成功响应 */
function respond(statusCode: number, data: unknown): void {
  uniMock.request.mockImplementation((options: UniRequestOptions) => {
    options.success?.({ statusCode, data })
    return { abort: vi.fn() }
  })
}

/** 让下一次 uni.request 同步返回失败 */
function failWith(errMsg: string): void {
  uniMock.request.mockImplementation((options: UniRequestOptions) => {
    options.fail?.({ errMsg })
    return { abort: vi.fn() }
  })
}

describe('buildUrl', () => {
  it('相对路径拼上 baseURL', () => {
    expect(buildUrl('/user/profile')).toBe('/api/user/profile')
    expect(buildUrl('user/profile')).toBe('/api/user/profile')
  })

  it('绝对地址原样返回', () => {
    expect(buildUrl('https://example.com/oauth')).toBe('https://example.com/oauth')
  })
})

describe('request 业务码处理', () => {
  beforeEach(() => {
    clearToken()
  })

  it('命中成功码时直接返回 data', async () => {
    respond(200, { code: 0, message: 'ok', data: { id: 1 } })
    await expect(get<{ id: number }>('/user/profile')).resolves.toEqual({ id: 1 })
  })

  it('业务码异常时抛出带 code 的 RequestError', async () => {
    respond(200, { code: 500, message: '服务异常', data: null })
    await expect(get('/x', undefined, { toast: false })).rejects.toMatchObject({
      name: 'RequestError',
      code: 500,
      message: '服务异常'
    })
  })

  it('HTTP 非 2xx 一律抛 RequestError', async () => {
    respond(502, { msg: 'bad gateway' })
    await expect(get('/x', undefined, { toast: false })).rejects.toBeInstanceOf(RequestError)
  })

  it('登录失效码顺带清掉本地 token', async () => {
    setToken('stale-token')
    respond(200, { code: 401, message: '未登录', data: null })

    await expect(get('/x', undefined, { toast: false })).rejects.toBeInstanceOf(RequestError)
    expect(getToken()).toBe('')
  })

  it('toast 开关生效', async () => {
    respond(200, { code: 500, message: '服务异常', data: null })
    await expect(get('/x', undefined, { toast: false })).rejects.toBeInstanceOf(RequestError)
    expect(uniMock.showToast).not.toHaveBeenCalled()

    await expect(get('/x')).rejects.toBeInstanceOf(RequestError)
    expect(uniMock.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: '服务异常', icon: 'none' })
    )
  })

  it('非标准响应体原样返回', async () => {
    respond(200, [1, 2, 3])
    await expect(get<number[]>('/raw')).resolves.toEqual([1, 2, 3])
  })

  it('网络失败归一化成 RequestError', async () => {
    failWith('request:fail timeout')
    await expect(get('/x', undefined, { toast: false })).rejects.toMatchObject({
      code: -1,
      message: 'request:fail timeout'
    })
  })
})

describe('request 请求头', () => {
  beforeEach(() => {
    clearToken()
  })

  it('默认注入 Authorization', async () => {
    setToken('token-123')
    respond(200, { code: 0, message: 'ok', data: null })

    await get('/x')

    const options = uniMock.request.mock.calls[0][0]
    expect(options.header?.Authorization).toBe('Bearer token-123')
    expect(options.url).toBe('/api/x')
  })

  it('auth: false 时不注入（登录接口）', async () => {
    setToken('token-123')
    respond(200, { code: 0, message: 'ok', data: null })

    await post('/auth/login', { username: 'demo' }, { auth: false })

    const options = uniMock.request.mock.calls[0][0]
    expect(options.header?.Authorization).toBeUndefined()
    expect(options.method).toBe('POST')
  })
})

describe('request loading 计数', () => {
  it('并发请求只开一次、最后一次才关', async () => {
    const resolvers: Array<() => void> = []
    uniMock.request.mockImplementation((options: UniRequestOptions) => {
      resolvers.push(() =>
        options.success?.({ statusCode: 200, data: { code: 0, message: 'ok', data: null } })
      )
      return { abort: vi.fn() }
    })

    const first = get('/a', undefined, { loading: true })
    const second = get('/b', undefined, { loading: true })

    expect(uniMock.showLoading).toHaveBeenCalledTimes(1)

    resolvers.forEach((resolve) => resolve())
    await Promise.all([first, second])

    expect(uniMock.hideLoading).toHaveBeenCalledTimes(1)
  })
})
