import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/store/modules/user'
import { getToken, setToken } from '@/utils/auth'
import type { UserInfo } from '@/api/types'

const demoUser: UserInfo = {
  userId: 1,
  userName: 'demo',
  nickName: '演示用户',
  avatar: ''
}

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('默认是未登录状态', () => {
    const store = useUserStore()
    expect(store.isLogged).toBe(false)
    expect(store.nickname).toBe('未登录')
    expect(store.userInfo).toBeNull()
  })

  it('setSession 同时写入内存与本地存储', () => {
    const store = useUserStore()

    store.setSession('t-1')
    store.setUserInfo(demoUser)

    expect(store.isLogged).toBe(true)
    expect(store.nickname).toBe('演示用户')
    expect(getToken()).toBe('t-1')
  })

  it('logout 清空内存与本地 token', () => {
    const store = useUserStore()
    store.setSession('t-1')
    store.setUserInfo(demoUser)

    store.logout()

    expect(store.isLogged).toBe(false)
    expect(store.userInfo).toBeNull()
    expect(getToken()).toBe('')
  })

  it('初始化时从本地已有 token 恢复登录态', () => {
    setToken('persisted-token')
    setActivePinia(createPinia())

    const store = useUserStore()

    expect(store.token).toBe('persisted-token')
    expect(store.isLogged).toBe(true)
  })

  it('setSession 不传用户信息时保留原有 userInfo', () => {
    const store = useUserStore()
    store.setUserInfo(demoUser)

    store.setSession('t-2')

    expect(store.userInfo).toEqual(demoUser)
    expect(store.token).toBe('t-2')
  })
})
