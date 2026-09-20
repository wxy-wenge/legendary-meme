<template>
  <view class="page">
    <view class="card">
      <text class="card__title">wot-design-uni 组件库</text>
      <view class="row">
        <text class="row__label">按钮</text>
        <view class="row__value">
          <wd-button size="small" type="primary" @click="onPrimary">主要按钮</wd-button>
        </view>
      </view>
      <view class="row">
        <text class="row__label">标签</text>
        <view class="row__value">
          <wd-tag type="success">已接入</wd-tag>
        </view>
      </view>
      <view class="row">
        <text class="row__label">单元格</text>
        <view class="row__value">
          <wd-cell title="当前平台" :value="platform" />
        </view>
      </view>
    </view>

    <view class="card">
      <text class="card__title">为什么用分包</text>
      <view v-for="note in notes" :key="note" class="bullet">
        <text class="bullet__dot">·</text>
        <text class="bullet__text">{{ note }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()
const platform = computed(() => appStore.systemInfo?.platform ?? 'unknown')

const notes: string[] = [
  '微信主包上限 2MB，业务页面必须进分包，否则后面加功能一定会被卡住',
  '分包目录：src/pages-sub/**，已在 pages.json 的 subPackages 里注册',
  '小程序端开启「分包优化」后，分包可以引用主包的公共模块，反之不行'
]

function onPrimary(): void {
  uni.showToast({ title: '组件库工作正常', icon: 'none' })
}
</script>
