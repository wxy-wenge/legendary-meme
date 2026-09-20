import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { userApi } from '@/api/modules/user'
import type { LoginParams, UserInfo } from '@/api/types'
import { clearToken, getToken, setToken } from '@/utils/auth'
import { uniStorage } from '../persist'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref(getToken())
    const userInfo = ref<UserInfo | null>(null)

    const isLogged = computed(() => token.value.length > 0)
    const nickname = computed(() => userInfo.value?.nickname || '未登录')

    /** 直接写入会话，用于登录成功后或测试 / 演示场景 */
    function setSession(nextToken: string, info?: UserInfo | null): void {
      token.value = nextToken
      setToken(nextToken)
      if (info !== undefined) userInfo.value = info
    }

    function setUserInfo(info: UserInfo | null): void {
      userInfo.value = info
    }

    async function login(params: LoginParams): Promise<UserInfo> {
      const result = await userApi.login(params)
      setSession(result.token, result.userInfo)
      return result.userInfo
    }

    async function fetchProfile(): Promise<UserInfo> {
      const info = await userApi.getProfile()
      userInfo.value = info
      return info
    }

    function logout(): void {
      token.value = ''
      userInfo.value = null
      clearToken()
    }

    return {
      token,
      userInfo,
      isLogged,
      nickname,
      setSession,
      setUserInfo,
      login,
      fetchProfile,
      logout
    }
  },
  {
    persist: {
      key: 'user',
      storage: uniStorage,
      pick: ['token', 'userInfo']
    }
  }
)
