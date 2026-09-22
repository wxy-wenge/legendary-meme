<template>
  <view class="page">
    <view v-if="!userStore.isLogged" class="guest">
      <text class="guest__title">还没有登录</text>
      <text class="guest__desc">登录后可以同步学习进度</text>
      <button class="btn btn--primary" @click="goLogin">登录 / 注册</button>
    </view>

    <view v-else class="profile">
      <view class="profile__head">
        <text class="profile__name">{{ userStore.nickname }}</text>
        <text class="profile__account">@{{ userStore.userInfo?.userName || '-' }}</text>
      </view>

      <button class="btn" @click="onLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

function goLogin(): void {
  uni.navigateTo({ url: '/pages-sub/auth/login' })
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
.guest {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx $uni-spacing-row-lg 0;

  &__title {
    font-size: 40rpx;
    font-weight: 600;
  }

  &__desc {
    margin: 16rpx 0 48rpx;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
  }
}

.profile {
  padding: 40rpx 0 0;

  &__head {
    padding: 48rpx $uni-spacing-row-base;
    margin-bottom: 40rpx;
    background-color: $uni-bg-color;
    border-radius: $uni-border-radius-lg;
  }

  &__name {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
  }

  &__account {
    display: block;
    margin-top: 12rpx;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
  }
}

.btn {
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  color: $uni-text-color;
  background-color: $uni-bg-color;
  border-radius: 12rpx;

  &::after {
    border: none;
  }

  &--primary {
    width: 360rpx;
    color: #ffffff;
    background-color: $uni-color-primary;
  }
}
</style>
