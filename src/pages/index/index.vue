<template>
  <view class="page">
    <view class="hero">
      <text class="hero__title">{{ appStore.title }}</text>
      <text class="hero__sub">
        {{ appStore.env }} · {{ platform }} · 主题 {{ isDark ? 'dark' : 'light' }}
      </text>
    </view>

    <view class="card">
      <text class="card__title">环境与配置</text>
      <view class="row">
        <text class="row__label">接口基础路径</text>
        <text class="row__value">{{ apiBaseUrl }}</text>
      </view>
      <view class="row">
        <text class="row__label">请求超时</text>
        <text class="row__value">{{ timeout }} ms</text>
      </view>
      <view class="row">
        <text class="row__label">运行环境值</text>
        <text class="row__value">{{ appEnv }}</text>
      </view>
      <view class="row">
        <text class="row__label">状态栏高度</text>
        <text class="row__value">{{ appStore.statusBarHeight }} px</text>
      </view>
    </view>

    <view class="card">
      <text class="card__title">请求封装 + 组合式函数</text>
      <button class="btn" size="mini" :loading="loading" @click="load">调用 /home/articles</button>
      <text v-if="error" class="error">{{ error.message }}</text>
      <view v-else-if="articles && articles.length" class="list">
        <view v-for="item in articles" :key="item.id" class="list__item">
          <text class="list__title">{{ item.title }}</text>
          <text class="list__desc">{{ item.summary }}</text>
        </view>
      </view>
      <app-empty
        v-else-if="loaded && !loading"
        title="没拿到数据"
        description="检查 .env.development 里的 VITE_PROXY_TARGET 是否可达"
        show-retry
        @retry="load"
      />
    </view>

    <view class="card">
      <text class="card__title">页面跳转</text>
      <button class="btn" size="mini" @click="goAbout">查看框架说明</button>
      <button class="btn" size="mini" @click="goSubDemo">分包 + 组件库示例</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { API_BASE_URL, APP_ENV, REQUEST_TIMEOUT } from '@/config'
import { homeApi } from '@/api/modules/home'
import { useAppStore } from '@/store/modules/app'
import { useRequest } from '@/composables/useRequest'
import { useTheme } from '@/composables/useTheme'

const appStore = useAppStore()
const { isDark } = useTheme()

const apiBaseUrl = API_BASE_URL
const appEnv = APP_ENV
const timeout = REQUEST_TIMEOUT

const platform = computed(() => appStore.systemInfo?.platform ?? 'unknown')

const { data: articles, loading, error, run: fetchArticles } = useRequest(homeApi.getArticles)
const loaded = ref(false)

async function load(): Promise<void> {
  loaded.value = true
  await fetchArticles({ page: 1, pageSize: 10 })
}

function goAbout(): void {
  uni.navigateTo({ url: '/pages/about/about' })
}

/** 分包页面，用于验证 subPackages 与 wot-design-uni 组件确实能编译进小程序包 */
function goSubDemo(): void {
  uni.navigateTo({ url: '/pages-sub/demo/demo' })
}
</script>
