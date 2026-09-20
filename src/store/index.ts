import type { App } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export function setupStore(app: App): void {
  app.use(pinia)
}

export * from './modules/app'
export * from './modules/user'
export { uniStorage } from './persist'
