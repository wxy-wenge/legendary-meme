import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { userApi } from '@/api/modules/user'
import type { LoginParams, LoginResult, RegisterParams, UserInfo } from '@/api/types'
import { clearToken, getToken, setRefreshToken, setToken } from '@/utils/auth'
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

    /**
     * 登录（POST /api/user/login）。
     *
     * 后端的 LoginVO 里**已经带了** nickname / avatar，所以不必为了显示昵称再调一次 /getInfo；
     * 只有 roles / permissions 得靠 /getInfo，这里顺手拉一次，失败也不阻断登录
     * —— 新模块用的是 AppUser，不一定在若依那套角色体系里。
     */
    async function login(params: LoginParams): Promise<LoginResult> {
      const res = await userApi.login(params)

      setSession(res.token)
      setRefreshToken(res.refreshToken)
      userInfo.value = {
        userId: res.userId,
        userName: res.username,
        nickName: res.nickname,
        avatar: res.avatar
      }

      try {
        await fetchProfile()
      } catch {
        // 拿不到角色 / 权限就当空的，不影响已经登录成功这件事
        roles.value = []
        permissions.value = []
      }

      return res
    }

    /** 注册（POST /api/user/register）。后端要求 nickname，confirmPassword 只是前端校验用 */
    async function register(params: RegisterParams): Promise<void> {
      await userApi.register({
        username: params.username,
        password: params.password,
        nickname: params.nickname,
        code: params.code,
        uuid: params.uuid
      })
    }

    async function fetchProfile(): Promise<UserInfo> {
      const info = await userApi.getInfo()
      userInfo.value = info.user
      roles.value = info.roles ?? []
      permissions.value = info.permissions ?? []
      return info.user
    }

    /**
     * 退出登录。
     * 先让后端把 token 拉进黑名单；后端不可用也必须能退出去，所以失败不阻断。
     */
    async function logout(): Promise<void> {
      try {
        await userApi.logout()
      } catch {
        // 忽略：本地会话一定要清干净
      }

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
