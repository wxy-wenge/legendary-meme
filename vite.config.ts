import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

/**
 * uni-app (Vue 3 + Vite + TS) 构建配置。
 *
 * 注意：`vite` 版本被 @dcloudio/vite-plugin-uni 的 peerDependencies 锁死为 5.2.8，
 * 升级 vite 前请先确认官方已放开该约束，否则 `uni` 命令会直接报 peer 冲突。
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const apiPrefix = env.VITE_API_PREFIX || '/api'
  const proxyTarget = env.VITE_PROXY_TARGET

  return {
    plugins: [uni()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src')
      }
    },
    server: {
      host: env.VITE_DEV_HOST || 'localhost',
      port: Number(env.VITE_DEV_PORT) || 5173,
      // 只有配置了 VITE_PROXY_TARGET 才挂代理，生产构建不受影响
      ...(proxyTarget
        ? {
            proxy: {
              [apiPrefix]: {
                target: proxyTarget,
                changeOrigin: true,
                rewrite: (p: string) => p.replace(new RegExp(`^${apiPrefix}`), '')
              }
            }
          }
        : {})
    }
  }
})
