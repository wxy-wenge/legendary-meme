<template>
  <view class="paper-page">
    <!-- 背景装饰层：纯装饰，全部在表单区域之外 -->
    <view class="deco">
      <view class="deco__glow"></view>
      <view class="deco__ring deco__ring--sm"></view>
      <view class="deco__progress"></view>
      <view class="deco__card">
        <view class="deco__card-line"></view>
        <view class="deco__card-line deco__card-line--short"></view>
      </view>
      <view class="deco__rule"></view>
      <view class="deco__ring deco__ring--lg"></view>
      <view class="deco__arc deco__arc--a"></view>
      <view class="deco__arc deco__arc--b"></view>
      <view class="deco__plant">
        <view class="deco__plant-stem"></view>
        <view class="deco__leaf deco__leaf--a"></view>
        <view class="deco__leaf deco__leaf--b"></view>
      </view>
      <view class="deco__note"></view>
      <view class="deco__book">
        <view class="deco__book-page deco__book-page--l"></view>
        <view class="deco__book-page deco__book-page--r"></view>
      </view>
      <view class="deco__pencil">
        <view class="deco__pencil-lead"></view>
      </view>
    </view>

    <view class="auth paper-content">
      <view class="auth__brand">
        <view class="auth__mark">
          <text class="auth__glyph">学</text>
        </view>
        <text class="auth__brand-text">学习平台</text>
      </view>

      <text class="auth__title">欢迎回来</text>
      <text class="auth__sub">登录后继续你的学习</text>

      <view class="form">
        <view class="field">
          <text class="field__label">账号</text>
          <input
            v-model="form.username"
            class="field__input"
            placeholder="请输入账号"
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
            placeholder="请输入密码"
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
          {{ loading ? '登录中' : '登 录' }}
        </button>
      </view>

      <view class="auth__foot">
        <text class="auth__foot-text">还没有账号？</text>
        <text class="auth__foot-link" @click="goRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { userApi } from '@/api/modules/user'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
  code: ''
})

const captcha = reactive({
  uuid: '',
  img: '',
  mockText: ''
})

/** 后端可能关闭验证码（captchaEnabled=false），此时隐藏输入框 */
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
    // 取验证码失败不阻塞登录，用户可点图片重试
  }
}

onLoad(() => {
  loadCaptcha()
})

function validate(): string {
  if (!form.username.trim()) return '请输入账号'
  if (!form.password) return '请输入密码'
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
    await userStore.login({
      username: form.username.trim(),
      password: form.password,
      code: captchaOn.value ? form.code.trim() : undefined,
      uuid: captchaOn.value ? captcha.uuid : undefined
    })
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      // 登录成功后统一回到「我的」页面
      uni.switchTab({ url: '/pages/user/user' })
    }, 600)
  } catch {
    // 失败提示由 request 层统一 toast；验证码是一次性的，这里重新取一张
    form.code = ''
    loadCaptcha()
  } finally {
    loading.value = false
  }
}

function goRegister(): void {
  uni.navigateTo({ url: '/pages-sub/auth/register' })
}
</script>

<style lang="scss" scoped>
@import './auth.scss';
</style>
