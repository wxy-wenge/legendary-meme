<template>
  <view class="auth-page">
    <view class="bg">
      <view class="bg__blob bg__blob--a"></view>
      <view class="bg__blob bg__blob--b"></view>
      <view class="bg__blob bg__blob--c"></view>
    </view>

    <view class="auth">
      <view class="auth__brand">
        <view class="auth__mark">
          <text class="auth__glyph">学</text>
        </view>
        <text class="auth__brand-text">学习平台</text>
      </view>

      <text class="auth__title">创建账号</text>
      <text class="auth__sub">注册后即可开始学习</text>

      <view class="card">
        <view class="field">
          <text class="field__label">账号</text>
          <input
            v-model="form.username"
            class="field__input"
            placeholder="2-20 个字符"
            placeholder-class="field__ph"
            :maxlength="20"
          />
        </view>

        <view class="field">
          <text class="field__label">密码</text>
          <input
            v-model="form.password"
            class="field__input"
            password
            placeholder="5-20 个字符"
            placeholder-class="field__ph"
            :maxlength="20"
          />
        </view>

        <view class="field">
          <text class="field__label">确认密码</text>
          <input
            v-model="form.confirmPassword"
            class="field__input"
            password
            placeholder="请再次输入密码"
            placeholder-class="field__ph"
            :maxlength="20"
          />
        </view>

        <view v-if="captchaOn" class="field">
          <text class="field__label">验证码</text>
          <view class="field__row">
            <input
              v-model="form.code"
              class="field__input field__input--code"
              placeholder="请输入计算结果"
              placeholder-class="field__ph"
              :maxlength="4"
            />
            <view class="captcha" @click="loadCaptcha">
              <image v-if="captcha.img" class="captcha__img" :src="captcha.img" mode="aspectFit" />
              <text v-else class="captcha__text">{{ captcha.mockText || '----' }}</text>
            </view>
          </view>
        </view>

        <button class="submit" :loading="loading" :disabled="loading" @click="onSubmit">
          {{ loading ? '注册中' : '注 册' }}
        </button>
      </view>

      <view class="auth__foot">
        <text class="auth__foot-text">已经有账号了？</text>
        <text class="auth__foot-link" @click="goLogin">去登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { userApi } from '@/api/modules/user'
import { useUserStore } from '@/store/modules/user'

/** 与后端 UserConstants 保持一致 */
const USERNAME_MIN = 2
const USERNAME_MAX = 20
const PASSWORD_MIN = 5
const PASSWORD_MAX = 20

const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  code: ''
})

const captcha = reactive({
  uuid: '',
  img: '',
  mockText: ''
})

const captchaOn = ref(true)
const loading = ref(false)

async function loadCaptcha(): Promise<void> {
  try {
    const res = await userApi.getCaptcha()
    captchaOn.value = res.captchaEnabled !== false
    captcha.uuid = res.uuid ?? ''
    captcha.img = res.img ?? ''
    captcha.mockText = res.mockText ?? ''
    if (!captchaOn.value) form.code = ''
  } catch {
    // 取验证码失败不阻塞注册，用户可点图片重试
  }
}

onLoad(() => {
  loadCaptcha()
})

function validate(): string {
  const username = form.username.trim()
  if (!username) return '请输入账号'
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return `账户长度必须在${USERNAME_MIN}到${USERNAME_MAX}个字符之间`
  }
  if (!form.password) return '请输入密码'
  if (form.password.length < PASSWORD_MIN || form.password.length > PASSWORD_MAX) {
    return `密码长度必须在${PASSWORD_MIN}到${PASSWORD_MAX}个字符之间`
  }
  if (form.password !== form.confirmPassword) return '两次输入的密码不一致'
  if (captchaOn.value && !form.code.trim()) return '请输入验证码'
  return ''
}

async function onSubmit(): Promise<void> {
  const message = validate()
  if (message) {
    uni.showToast({ title: message, icon: 'none' })
    return
  }

  loading.value = true
  try {
    await userStore.register({
      username: form.username.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      code: captchaOn.value ? form.code.trim() : undefined,
      uuid: captchaOn.value ? captcha.uuid : undefined
    })
    uni.showToast({ title: '注册成功，请登录', icon: 'none' })
    setTimeout(() => {
      // 用 redirectTo 替换当前页，避免用户返回后又回到注册页
      uni.redirectTo({ url: '/pages-sub/auth/login' })
    }, 800)
  } catch {
    // 失败提示由 request 层统一 toast；验证码是一次性的，这里重新取一张
    form.code = ''
    loadCaptcha()
  } finally {
    loading.value = false
  }
}

function goLogin(): void {
  uni.redirectTo({ url: '/pages-sub/auth/login' })
}
</script>

<style lang="scss" scoped>
@import './auth.scss';
</style>
