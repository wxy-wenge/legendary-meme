<template>
  <view class="paper-page">
    <view class="deco">
      <view class="deco__glow"></view>
    </view>

    <view class="home paper-content">
      <!-- 头像：一半压在卡片上 -->
      <view class="hero">
        <view class="hero__avatar">
          <image v-if="avatar" class="hero__img" :src="avatar" mode="aspectFill" />
          <text v-else class="hero__letter">{{ avatarLetter }}</text>
        </view>
      </view>

      <!-- 资料卡 -->
      <view class="card">
        <view class="card__refresh" @click="refresh">
          <text class="card__refresh-icon">↻</text>
        </view>

        <text class="card__name">{{ nickname }}</text>

        <view v-if="identity" class="card__tag">
          <text class="card__tag-text">{{ identity }}</text>
        </view>
      </view>

      <!-- 页内切换 -->
      <view class="tabs">
        <view
          v-for="(item, index) in tabs"
          :key="item.label"
          class="tabs__item"
          :class="{ 'tabs__item--on': index === active }"
          @click="active = index"
        >
          <text class="tabs__text">{{ item.label }}</text>
        </view>
      </view>

      <!-- 面板 -->
      <view class="panel">
        <view v-if="active === 0">
          <text class="panel__label">关于我</text>
          <text class="panel__text" :class="{ 'panel__text--empty': !intro }">
            {{ intro || '还没有填写个人简介' }}
          </text>
        </view>

        <view v-else class="ph panel__ph">
          <text class="ph__text">{{ currentTab }} · 列表待接口接入</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const active = ref(0)
const tabs = [
  { label: '个人简介' },
  { label: '观看历史' },
  { label: '我的收藏' },
  { label: '我的书架' }
]

const currentTab = computed(() => tabs[active.value]?.label ?? '')

const nickname = computed(() => userStore.userInfo?.nickName || '未登录')
const avatar = computed(() => userStore.userInfo?.avatar || '')
const avatarLetter = computed(() => nickname.value.slice(0, 1).toUpperCase())

/**
 * 个人简介与身份标签：后端 sys_user 目前没有对应字段，
 * 先把取值位置留好，接口加上后换成真实数据即可。
 */
const intro = ref('')
const identity = ref('')

/** 卡片右上角刷新：重新拉一次用户资料 */
async function refresh(): Promise<void> {
  if (!userStore.isLogged) return
  try {
    await userStore.fetchProfile()
    uni.showToast({ title: '已刷新', icon: 'none' })
  } catch {
    // 失败提示由 request 层统一 toast
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/skeleton.scss';

.home {
  min-height: 100vh;
  padding-bottom: 60rpx;
}

/* ---------- 头像 ---------- */

.hero {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding-top: 48rpx;
}

.hero__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 280rpx;
  height: 280rpx;
  overflow: hidden;
  background-color: $ink;
  border: 6rpx solid rgba(255, 252, 246, 0.9);
  border-radius: 50%;
}

.hero__img {
  width: 100%;
  height: 100%;
}

.hero__letter {
  font-size: 96rpx;
  font-weight: 600;
  color: $paper;
}

/* ---------- 资料卡 ---------- */

.card {
  position: relative;
  z-index: 1;
  margin: -140rpx 44rpx 0;
  padding: 180rpx 40rpx 48rpx;
  text-align: center;
  background-color: rgba(255, 252, 246, 0.94);
  border: 2rpx solid rgba(24, 58, 55, 0.08);
  border-radius: 28rpx;
}

.card__refresh {
  position: absolute;
  top: 28rpx;
  right: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
}

.card__refresh-icon {
  font-size: 40rpx;
  line-height: 1;
  color: rgba(138, 129, 124, 0.85);
}

.card__name {
  display: block;
  font-size: 48rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  color: $ink;
}

.card__tag {
  display: inline-block;
  padding: 10rpx 32rpx;
  margin-top: 24rpx;
  background-color: #f1efea;
  border-radius: 999rpx;
}

.card__tag-text {
  font-size: 26rpx;
  color: $ink;
}

/* ---------- 页内切换 ---------- */

.tabs {
  display: flex;
  align-items: center;
  padding: 0 44rpx;
  margin-top: 44rpx;
}

.tabs__item {
  padding-bottom: 12rpx;
  margin-right: 48rpx;
  border-bottom: 6rpx solid transparent;
}

.tabs__item--on {
  border-bottom-color: $coral;
}

.tabs__text {
  font-size: 30rpx;
  color: $warm-gray;
}

.tabs__item--on .tabs__text {
  font-weight: 600;
  color: $ink;
}

/* ---------- 面板 ---------- */

.panel {
  padding: 48rpx 44rpx 0;
}

.panel__label {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $ink;
}

.panel__text {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  line-height: 1.9;
  color: $warm-gray;
}

.panel__text--empty {
  color: rgba(138, 129, 124, 0.7);
}

.panel__ph {
  height: 320rpx;
}
</style>
