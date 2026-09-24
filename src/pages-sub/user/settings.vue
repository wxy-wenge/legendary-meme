<template>
  <view class="paper-page">
    <view class="deco">
      <view class="deco__glow"></view>
      <view class="deco__ring deco__ring--lg"></view>
      <view class="deco__note"></view>
    </view>

    <view class="settings paper-content">
      <view class="group">
        <view
          v-for="(item, index) in entries"
          :key="item.label"
          class="row"
          :class="{ 'row--last': index === entries.length - 1 }"
          @click="go(item.url)"
        >
          <text class="row__text">{{ item.label }}</text>
          <text class="row__arrow">›</text>
        </view>
      </view>

      <button class="btn" @click="onLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'

interface Entry {
  label: string
  url: string
}

const userStore = useUserStore()

const entries: Entry[] = [
  { label: '编辑资料', url: '/pages-sub/user/profile-edit' },
  { label: '账号安全', url: '/pages-sub/user/security' },
  { label: '通知设置', url: '/pages-sub/user/notice' },
  { label: '意见反馈', url: '/pages-sub/user/feedback' },
  { label: '我的内容', url: '/pages-sub/user/my-content' }
]

function go(url: string): void {
  uni.navigateTo({ url })
}

function onLogout(): void {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    success: (res) => {
      if (!res.confirm) return
      userStore.logout()
      uni.showToast({ title: '已退出登录', icon: 'none' })
    }
  })
}
</script>

<style lang="scss" scoped>
@import '../../styles/book-theme.scss';

.settings {
  min-height: 100vh;
  padding: 40rpx 44rpx 80rpx;
}

.group {
  padding: 0 28rpx;
  background-color: rgba(255, 252, 246, 0.9);
  border: 2rpx solid rgba(24, 58, 55, 0.08);
  border-radius: 20rpx;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 34rpx 0;
  border-bottom: 2rpx solid rgba(24, 58, 55, 0.1);
}

.row--last {
  border-bottom: none;
}

.row__text {
  font-size: 30rpx;
  color: $ink;
}

.row__arrow {
  font-size: 34rpx;
  color: rgba(138, 129, 124, 0.7);
}

.btn {
  height: 96rpx;
  margin-top: 64rpx;
  font-size: 30rpx;
  letter-spacing: 4rpx;
  color: $ink;
  background-color: transparent;
  border: 2rpx solid rgba(24, 58, 55, 0.28);
  border-radius: 6rpx;
}

.btn::after {
  border: none;
}
</style>
