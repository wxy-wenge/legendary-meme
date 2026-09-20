<template>
  <view class="page">
    <view class="profile">
      <text class="profile__name">{{ userStore.nickname }}</text>
      <text class="profile__state">{{ userStore.isLogged ? '已登录' : '未登录' }}</text>
    </view>

    <view class="card">
      <text class="card__title">会话状态（Pinia 持久化）</text>
      <view class="row">
        <text class="row__label">token</text>
        <text class="row__value">{{ tokenPreview }}</text>
      </view>
      <view class="row">
        <text class="row__label">用户 ID</text>
        <text class="row__value">{{ userStore.userInfo?.id ?? '-' }}</text>
      </view>
      <view class="row">
        <text class="row__label">手机号</text>
        <text class="row__value">{{ maskedPhone }}</text>
      </view>
    </view>

    <view class="card">
      <text class="card__title">操作</text>
      <button class="btn" size="mini" @click="mockLogin">模拟登录（不请求接口）</button>
      <button class="btn" size="mini" :loading="loading" @click="loadProfile">
        拉取用户信息（走 /user/profile）
      </button>
      <button class="btn" size="mini" @click="userStore.logout()">退出登录</button>
      <text v-if="error" class="error">{{ error.message }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useRequest } from '@/composables/useRequest'
import { maskPhone } from '@/utils/format'

const userStore = useUserStore()

const { loading, error, run: fetchProfile } = useRequest(() => userStore.fetchProfile())

const tokenPreview = computed(() => (userStore.token ? `${userStore.token.slice(0, 12)}...` : '无'))

const maskedPhone = computed(() =>
  userStore.userInfo?.phone ? maskPhone(userStore.userInfo.phone) : '-'
)

/** 演示用：直接写入本地会话，接入真实后端后改调 userStore.login() */
function mockLogin(): void {
  userStore.setSession('mock-token-0123456789abcdef', {
    id: 1,
    username: 'demo',
    nickname: '演示用户',
    avatar: '',
    phone: '13812345678',
    email: 'demo@example.com',
    roles: ['user']
  })
}

async function loadProfile(): Promise<void> {
  await fetchProfile()
}
</script>
