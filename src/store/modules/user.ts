import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { userApi } from '@/api/modules/user'
import type { LoginParams, RegisterParams, UserInfo } from '@/api/types'
import { clearToken, getToken, setToken } from '@/utils/auth'
import { uniStorage } from '../persist'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref(getToken())
    const userInfo = ref<UserInfo | null>(null)
    const roles = ref<string[]>([])
    const permissions = ref<string[]>([])

    const isLogged = computed(() => token.value.length > 0)
    const nickname = computed(() => userInfo.value?.nickName || '未登录')

    /** 直接写入会话，用于登录成功后或测试 / 演示场景 */
    function setSession(nextToken: string): void {
      token.value = nextToken
      setToken(nextToken)
    }

    function setUserInfo(info: UserInfo | null): void {
      userInfo.value = info
    }

    /** 登录：换取 token 后拉取用户信息 / 角色 / 权限 */
    async function login(params: LoginParams): Promise<UserInfo> {
      const { token: nextToken } = await userApi.login(params)
      setSession(nextToken)
      return fetchProfile()
    }

    /** 注册：若依的 /register。注册成功后不自动登录，由页面跳回登录页 */
    async function register(params: RegisterParams): Promise<void> {
      await userApi.register(params)
    }

    async function fetchProfile(): Promise<UserInfo> {
      const info = await userApi.getInfo()
      userInfo.value = info.user
      roles.value = info.roles ?? []
      permissions.value = info.permissions ?? []
      return info.user
    }

    function logout(): void {
      token.value = ''
      userInfo.value = null
      roles.value = []
      permissions.value = []
      clearToken()
    }

    return {
      token,
      userInfo,
      roles,
      permissions,
      isLogged,
      nickname,
      setSession,
      setUserInfo,
      login,
      register,
      fetchProfile,
      logout
    }
  },
  {
    persist: {
      key: 'user',
      storage: uniStorage,
      // roles/permissions 每次登录后重新拉取，不落盘
      pick: ['token', 'userInfo']
    }
  }
)
