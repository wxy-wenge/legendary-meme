<template>
  <view class="paper-page">
    <!-- 背景装饰层：纯装饰，都在内容区之外 -->
    <view class="deco">
      <view class="deco__glow"></view>
      <view class="deco__rule"></view>
      <view class="deco__ring deco__ring--lg"></view>
      <view class="deco__arc deco__arc--a"></view>
      <view class="deco__arc deco__arc--b"></view>
      <view class="deco__plant">
        <view class="deco__plant-stem"></view>
        <view class="deco__leaf deco__leaf--a"></view>
        <view class="deco__leaf deco__leaf--b"></view>
      </view>
      <view class="deco__book">
        <view class="deco__book-page deco__book-page--l"></view>
        <view class="deco__book-page deco__book-page--r"></view>
      </view>
      <view class="deco__note"></view>
    </view>

    <!-- 未登录 -->
    <view v-if="!isLogged" class="mine paper-content">
      <view class="guest">
        <view class="guest__mark">
          <text class="guest__glyph">学</text>
        </view>
        <text class="guest__title">还没有登录</text>
        <text class="guest__desc">登录后可以记录学习进度、收藏课程</text>
        <button class="btn btn--primary" @click="goLogin">登录 / 注册</button>
      </view>
    </view>

    <!-- 已登录 -->
    <view v-else class="mine paper-content">
      <view class="profile">
        <view class="avatar">
          <image v-if="avatar" class="avatar__img" :src="avatar" mode="aspectFill" />
          <text v-else class="avatar__letter">{{ avatarLetter }}</text>
        </view>
        <view class="profile__text">
          <text class="profile__name">{{ nickname }}</text>
          <text class="profile__account">账号：{{ account }}</text>
        </view>
      </view>

      <view class="section">
        <text class="section__title">个人信息</text>

        <view class="row">
          <text class="row__label">昵称</text>
          <text class="row__value">{{ nickname }}</text>
        </view>

        <view class="row">
          <text class="row__label">账号</text>
          <text class="row__value">{{ account }}</text>
        </view>

        <view class="row">
          <text class="row__label">手机号</text>
          <text class="row__value" :class="{ 'row__value--empty': !phone }">
            {{ phone || '未设置' }}
          </text>
        </view>

        <view class="row row--last">
          <text class="row__label">邮箱</text>
          <text class="row__value" :class="{ 'row__value--empty': !email }">
            {{ email || '未设置' }}
          </text>
        </view>
      </view>

      <!-- 以后加「我的课程 / 收藏 / 设置」之类的入口，照这个 section 往下复制即可 -->

      <button class="btn btn--ghost" @click="onLogout">退出登录</button>
    </view>
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
@import '../../styles/book-theme.scss';

.mine {
  padding: 150rpx 56rpx 120rpx;
}

/* ---------- 未登录 ---------- */

.guest {
  display: flex;
  flex-direction: column;
  align-items: center;

  /* 比登录页的品牌标记更大、圆角更大，跟头像(圆形)、按钮(6rpx)区分开 */
  &__mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 136rpx;
    height: 136rpx;
    background-color: $ink;
    border-radius: 30rpx;
  }

  &__glyph {
    font-size: 64rpx;
    font-weight: 600;
    color: $paper;
  }

  &__title {
    margin-top: 52rpx;
    font-size: 44rpx;
    font-weight: 600;
    letter-spacing: 2rpx;
    color: $ink;
  }

  &__desc {
    margin-top: 20rpx;
    font-size: 26rpx;
    line-height: 1.8;
    letter-spacing: 1rpx;
    color: $warm-gray;
  }
}

/* ---------- 已登录 ---------- */

.profile {
  display: flex;
  align-items: center;

  &__text {
    flex: 1;
    margin-left: 28rpx;
    overflow: hidden;
  }

  &__name {
    display: block;
    font-size: 44rpx;
    font-weight: 600;
    letter-spacing: 2rpx;
    color: $ink;
  }

  &__account {
    display: block;
    margin-top: 12rpx;
    font-size: 26rpx;
    color: $warm-gray;
  }
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 128rpx;
  height: 128rpx;
  background-color: $ink;
  border-radius: 50%;
  overflow: hidden;

  &__img {
    width: 100%;
    height: 100%;
  }

  &__letter {
    font-size: 52rpx;
    font-weight: 600;
    color: $paper;
  }
}

.section {
  margin-top: 80rpx;

  &__title {
    display: block;
    font-size: 26rpx;
    letter-spacing: 2rpx;
    color: $warm-gray;
  }
}

/* 信息行用下划线分隔，和登录页的下划线输入是同一套语言 */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0;
  border-bottom: 2rpx solid rgba(24, 58, 55, 0.1);

  &--last {
    border-bottom: none;
  }

  &__label {
    flex-shrink: 0;
    margin-right: 24rpx;
    font-size: 30rpx;
    color: $warm-gray;
  }

  &__value {
    flex: 1;
    font-size: 30rpx;
    color: $ink;
    text-align: right;
    word-break: break-all;

    &--empty {
      color: rgba(138, 129, 124, 0.6);
    }
  }
}

/* ---------- 按钮 ---------- */

.btn {
  height: 96rpx;
  line-height: 96rpx;
  font-size: 30rpx;
  letter-spacing: 4rpx;
  border-radius: 6rpx;

  &::after {
    border: none;
  }

  &--primary {
    width: 440rpx;
    margin-top: 76rpx;
    color: $paper;
    background-color: $ink;
  }

  &--ghost {
    margin-top: 64rpx;
    color: $ink;
    background-color: transparent;
    border: 2rpx solid rgba(24, 58, 55, 0.28);
  }
}
</style>
