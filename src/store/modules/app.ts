import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { APP_ENV, APP_TITLE } from '@/config'
import { uniStorage } from '../persist'

export type ThemeMode = 'light' | 'dark' | 'auto'

type SystemInfo = ReturnType<typeof uni.getSystemInfoSync>

export const useAppStore = defineStore(
  'app',
  () => {
    const theme = ref<ThemeMode>('auto')
    const systemInfo = ref<SystemInfo | null>(null)

    /** auto 模式下跟随系统 */
    const isDark = computed(() =>
      theme.value === 'auto' ? systemInfo.value?.theme === 'dark' : theme.value === 'dark'
    )

    const statusBarHeight = computed(() => systemInfo.value?.statusBarHeight ?? 0)

    function initSystemInfo(): SystemInfo | null {
      try {
        systemInfo.value = uni.getSystemInfoSync()
      } catch {
        systemInfo.value = null
      }
      return systemInfo.value
    }

    function setTheme(mode: ThemeMode): void {
      theme.value = mode
    }

    return {
      title: APP_TITLE,
      env: APP_ENV,
      theme,
      systemInfo,
      isDark,
      statusBarHeight,
      initSystemInfo,
      setTheme
    }
  },
  {
    persist: {
      key: 'app',
      storage: uniStorage,
      // systemInfo 属于运行时数据，不落盘
      pick: ['theme']
    }
  }
)
