import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

/**
 * 单元测试独立于 uni-app 编译器运行：
 * uni 内置标签（view/text/button…）在 jsdom 下会被当作自定义元素渲染，
 * 这样组件测试既不需要真机 / 小程序环境，也不用为每个标签写 stub。
 */
const UNI_TAGS = [
  'view',
  'scroll-view',
  'swiper',
  'swiper-item',
  'movable-area',
  'movable-view',
  'cover-view',
  'cover-image',
  'text',
  'rich-text',
  'progress',
  'button',
  'checkbox',
  'checkbox-group',
  'editor',
  'form',
  'input',
  'label',
  'picker',
  'picker-view',
  'picker-view-column',
  'radio',
  'radio-group',
  'slider',
  'switch',
  'textarea',
  'navigator',
  'audio',
  'camera',
  'image',
  'video',
  'live-player',
  'live-pusher',
  'map',
  'canvas',
  'open-data',
  'web-view',
  'ad',
  'official-account',
  'page-meta',
  'navigation-bar'
]

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag: string) => UNI_TAGS.includes(tag)
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/*.d.ts', 'src/main.ts', 'src/pages/**']
    }
  }
})
