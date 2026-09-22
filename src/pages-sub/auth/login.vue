<template>
  <view class="page">
    <view class="auth">
      <view class="auth__head">
        <text class="auth__title">欢迎回来</text>
        <text class="auth__sub">登录后继续学习</text>
      </view>

      <view class="field">
        <text class="field__label">账号</text>
        <input
          v-model="form.username"
          class="field__input"
          placeholder="请输入账号"
          placeholder-class="field__ph"
          :maxlength="30"
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
          :maxlength="30"
        />
      </view>

      <view v-if="captchaOn" class="field">
        <text class="field__label">验证码</text>
        <view class="field__row">
          <input
            v-model="form.code"
            class="field__input field__input--code"
            placeholder="请输入验证码"
            placeholder-class="field__ph"
            :maxlength="6"
          />
          <view class="captcha" @click="loadCaptcha">
            <image v-if="captcha.img" class="captcha__img" :src="captcha.img" mode="aspectFit" />
            <text v-else class="captcha__text">{{ captcha.mockCode || '----' }}</text>
          </view>
        </view>
      </view>

      <button class="submit" :loading="loading" :disabled="loading" @click="onSubmit">
        {{ loading ? '登录中' : '登 录' }}
      </button>

      <view class="auth__foot">
        <text class="auth__foot-text">还没有账号？</text>
        <text class="auth__foot-link" @click="goRegister">去注册</text>
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
  mockCode: ''
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
    captcha.mockCode = res.mockCode ?? ''
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
      const pages = getCurrentPages()
      if (pages.length > 1) uni.navigateBack()
      else uni.switchTab({ url: '/pages/user/user' })
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
.auth {
  padding: 60rpx $uni-spacing-row-lg 0;

  &__head {
    margin-bottom: 64rpx;
  }

  &__title {
    display: block;
    font-size: 48rpx;
    font-weight: 600;
  }

  &__sub {
    display: block;
    margin-top: 12rpx;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 44rpx;
    font-size: $uni-font-size-sm;
  }

  &__foot-text {
    color: $uni-text-color-grey;
  }

  &__foot-link {
    margin-left: 8rpx;
    color: $uni-color-primary;
  }
}

.field {
  margin-bottom: 36rpx;

  &__label {
    display: block;
    margin-bottom: 14rpx;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
  }

  &__row {
    display: flex;
    align-items: center;
  }

  &__input {
    width: 100%;
    height: 88rpx;
    padding: 0 24rpx;
    background-color: #f4f6f9;
    border-radius: 12rpx;
    font-size: $uni-font-size-base;
    color: $uni-text-color;
  }

  &__input--code {
    flex: 1;
    width: auto;
  }

  &__ph {
    color: $uni-text-color-placeholder;
  }
}

.captcha {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200rpx;
  height: 88rpx;
  margin-left: 20rpx;
  background-color: #eef2fb;
  border-radius: 12rpx;
  overflow: hidden;

  &__img {
    width: 100%;
    height: 100%;
  }

  &__text {
    font-size: 36rpx;
    font-weight: 600;
    letter-spacing: 8rpx;
    color: #3b6fd4;
  }
}

.submit {
  height: 92rpx;
  margin-top: 20rpx;
  line-height: 92rpx;
  font-size: 32rpx;
  color: #ffffff;
  background-color: $uni-color-primary;
  border-radius: 12rpx;

  &::after {
    border: none;
  }

  &[disabled] {
    opacity: 0.6;
  }
}
</style>
