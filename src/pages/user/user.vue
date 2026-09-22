<template>
  <view class="mine">
    <!-- 顶部用户卡片 -->
    <view class="hero">
      <view class="hero__blob"></view>

      <view v-if="isLogged" class="hero__main">
        <view class="avatar">
          <image v-if="avatar" class="avatar__img" :src="avatar" mode="aspectFill" />
          <text v-else class="avatar__letter">{{ avatarLetter }}</text>
        </view>
        <view class="hero__text">
          <text class="hero__name">{{ nickname }}</text>
          <text class="hero__account">账号：{{ account }}</text>
        </view>
      </view>

      <view v-else class="hero__main">
        <view class="avatar avatar--guest">
          <text class="avatar__letter">?</text>
        </view>
        <view class="hero__text">
          <text class="hero__name">还没有登录</text>
          <text class="hero__account">登录后查看个人信息</text>
        </view>
      </view>
    </view>

    <!-- 未登录 -->
    <view v-if="!isLogged" class="card card--lift">
      <button class="btn btn--primary" @click="goLogin">登录 / 注册</button>
    </view>

    <!-- 已登录 -->
    <template v-else>
      <view class="card card--lift">
        <text class="card__title">个人信息</text>

        <view class="cell">
          <text class="cell__label">昵称</text>
          <text class="cell__value">{{ nickname }}</text>
        </view>

        <view class="cell">
          <text class="cell__label">账号</text>
          <text class="cell__value">{{ account }}</text>
        </view>

        <view class="cell">
          <text class="cell__label">手机号</text>
          <text class="cell__value" :class="{ 'cell__value--empty': !phone }">
            {{ phone || '未设置' }}
          </text>
        </view>

        <view class="cell">
          <text class="cell__label">邮箱</text>
          <text class="cell__value" :class="{ 'cell__value--empty': !email }">
            {{ email || '未设置' }}
          </text>
        </view>
      </view>

      <!-- 后续加「我的课程 / 收藏 / 设置」之类的入口，照这个卡片往下复制即可 -->

      <view class="card">
        <button class="btn" @click="onLogout">退出登录</button>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const isLogged = computed(() => userStore.isLogged)
const nickname = computed(() => userStore.userInfo?.nickName || '未命名')
const account = computed(() => userStore.userInfo?.userName || '-')
const phone = computed(() => userStore.userInfo?.phonenumber || '')
const email = computed(() => userStore.userInfo?.email || '')
const avatar = computed(() => userStore.userInfo?.avatar || '')
const avatarLetter = computed(() => nickname.value.slice(0, 1).toUpperCase())

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
.mine {
  min-height: 100vh;
  padding-bottom: 40rpx;
  background-color: $uni-bg-color-grey;
}

/* ---------- 顶部 ---------- */

.hero {
  position: relative;
  padding: 60rpx 40rpx 100rpx;
  overflow: hidden;
  background: linear-gradient(150deg, #dfe9ff 0%, #eef4ff 55%, #f6f8fc 100%);

  &__blob {
    position: absolute;
    top: -160rpx;
    right: -140rpx;
    width: 420rpx;
    height: 420rpx;
    background: linear-gradient(140deg, #c3d8ff, #e6efff);
    border-radius: 50%;
    opacity: 0.7;
  }

  &__main {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__text {
    flex: 1;
    margin-left: 28rpx;
    overflow: hidden;
  }

  &__name {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: #1f2d45;
  }

  &__account {
    display: block;
    margin-top: 10rpx;
    font-size: $uni-font-size-sm;
    color: #7c869a;
  }
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 128rpx;
  height: 128rpx;
  background: linear-gradient(140deg, #4f93ff, #2f6bff);
  border-radius: 50%;
  box-shadow: 0 10rpx 24rpx rgba(47, 107, 255, 0.26);
  overflow: hidden;

  &--guest {
    background: linear-gradient(140deg, #b9c3d6, #d7dee9);
    box-shadow: none;
  }

  &__img {
    width: 100%;
    height: 100%;
  }

  &__letter {
    font-size: 52rpx;
    font-weight: 600;
    color: #ffffff;
  }
}

/* ---------- 卡片 ---------- */

.card {
  padding: 12rpx 32rpx;
  margin: 0 24rpx 24rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(31, 66, 135, 0.07);

  /* 首张卡片往上提，压住头部渐变区 */
  &--lift {
    margin-top: -60rpx;
  }

  &__title {
    display: block;
    padding: 32rpx 0 8rpx;
    font-size: $uni-font-size-sm;
    color: #8a94a6;
  }
}

/* ---------- 信息行 ---------- */

.cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
  border-bottom: 2rpx solid #f2f4f8;

  &:last-child {
    border-bottom: none;
  }

  &__label {
    flex-shrink: 0;
    margin-right: 24rpx;
    font-size: $uni-font-size-base;
    color: #4a5568;
  }

  &__value {
    flex: 1;
    font-size: $uni-font-size-base;
    color: #1f2d45;
    text-align: right;
    word-break: break-all;

    &--empty {
      color: #b3bac7;
    }
  }
}

/* ---------- 按钮 ---------- */

.btn {
  height: 88rpx;
  margin: 24rpx 0;
  line-height: 88rpx;
  font-size: 30rpx;
  color: #4a5568;
  background-color: #f5f7fb;
  border-radius: 16rpx;

  &::after {
    border: none;
  }

  &--primary {
    color: #ffffff;
    background: linear-gradient(135deg, #4f93ff 0%, #2f6bff 100%);
    box-shadow: 0 10rpx 24rpx rgba(47, 107, 255, 0.24);
  }
}
</style>
