import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import type { ThemeMode } from '@/store/modules/app'

export function useTheme() {
  const appStore = useAppStore()
  const { theme, isDark } = storeToRefs(appStore)

  function setTheme(mode: ThemeMode): void {
    appStore.setTheme(mode)
  }

  function toggleTheme(): void {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return {
    theme: computed(() => theme.value),
    isDark,
    setTheme,
    toggleTheme
  }
}
