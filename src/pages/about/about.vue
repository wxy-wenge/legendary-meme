<template>
  <view class="page">
    <view class="card">
      <text class="card__title">目录分层</text>
      <view v-for="item in layers" :key="item.name" class="row row--stack">
        <text class="row__label">{{ item.name }}</text>
        <text class="row__value">{{ item.desc }}</text>
      </view>
    </view>

    <view class="card">
      <text class="card__title">已内置能力</text>
      <view v-for="item in features" :key="item" class="bullet">
        <text class="bullet__dot">·</text>
        <text class="bullet__text">{{ item }}</text>
      </view>
    </view>

    <view class="card">
      <text class="card__title">常用命令</text>
      <view v-for="cmd in commands" :key="cmd.name" class="row row--stack">
        <text class="row__label">{{ cmd.name }}</text>
        <text class="row__value">{{ cmd.desc }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Layer {
  name: string
  desc: string
}

const layers: Layer[] = [
  { name: 'src/pages', desc: '页面，路径与 pages.json 一一对应' },
  { name: 'src/components', desc: 'easycom 组件，目录名即标签名（app-empty）' },
  { name: 'src/composables', desc: '组合式函数，如 useRequest / useTheme' },
  { name: 'src/store', desc: 'Pinia store，按 modules 拆分并支持持久化' },
  { name: 'src/api', desc: '接口定义，按业务模块拆分，类型集中在 types.ts' },
  { name: 'src/utils', desc: 'request 封装、storage、auth、纯函数格式化' },
  { name: 'src/config', desc: '统一读取 import.meta.env，业务代码不直接碰 env' },
  { name: 'tests', desc: 'Vitest 用例，与 src 结构镜像' }
]

const features: string[] = [
  'Vue 3 + Vite + TypeScript（vite 锁 5.2.8，与 uni-app 官方 peer 对齐）',
  'Pinia + pinia-plugin-persistedstate（已适配 uni 存储，非 localStorage）',
  'request 封装：baseURL、token 注入、业务码校验、loading 计数、失败 toast',
  '多环境：.env / .env.development / .env.production',
  'ESLint 9 (flat config) + Prettier + EditorConfig，保存即格式化',
  'Vitest + Vue Test Utils + jsdom，uni 内置标签按自定义元素渲染',
  'Husky + lint-staged + commitlint，提交前自动校验'
]

const commands: Layer[] = [
  { name: 'npm run dev:h5', desc: 'H5 开发调试' },
  { name: 'npm run dev:mp-weixin', desc: '微信小程序开发' },
  { name: 'npm run build:h5', desc: 'H5 生产构建' },
  { name: 'npm run test', desc: '跑单元测试' },
  { name: 'npm run type-check', desc: 'vue-tsc 类型检查' },
  { name: 'npm run lint', desc: 'ESLint 检查并自动修复' }
]
</script>
