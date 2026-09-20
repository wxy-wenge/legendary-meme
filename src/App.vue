<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { useAppStore } from '@/store/modules/app'

onLaunch(() => {
  const appStore = useAppStore()
  appStore.initSystemInfo()
})

onShow(() => {
  // 从后台回到前台时触发：可在此刷新用户信息 / token
})

onHide(() => {
  // 退到后台时触发：可在此上报埋点、暂停定时器
})
</script>

<style lang="scss">
/* 全局样式与主题变量，uni.scss 会被自动注入，无需手动 @import */
page {
  background-color: $uni-bg-color-grey;
  color: $uni-text-color;
  font-size: $uni-font-size-base;
  line-height: 1.6;
}

view,
text {
  box-sizing: border-box;
}

.text-muted {
  color: $uni-text-color-grey;
}

/* ---- 以下为页面通用骨架样式，各页面通过 .page / .card / .row 复用 ---- */

.page {
  min-height: 100vh;
  padding: $uni-spacing-row-base;
}

.hero {
  padding: $uni-spacing-row-base 0 40rpx;

  &__title {
    display: block;
    font-size: 44rpx;
    font-weight: 600;
  }

  &__sub {
    display: block;
    margin-top: $uni-spacing-col-sm;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
  }
}

.profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx $uni-spacing-row-base;
  margin-bottom: $uni-spacing-row-base;
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;

  &__name {
    font-size: $uni-font-size-lg;
    font-weight: 600;
  }

  &__state {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
  }
}

.card {
  padding: $uni-spacing-row-base;
  margin-bottom: $uni-spacing-row-base;
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;

  &__title {
    display: block;
    margin-bottom: $uni-spacing-col-base;
    font-size: $uni-font-size-base;
    font-weight: 600;
  }
}

.row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: $uni-spacing-col-sm 0;

  &--stack {
    flex-direction: column;
    align-items: flex-start;
  }

  &__label {
    flex-shrink: 0;
    margin-right: $uni-spacing-row-base;
    color: $uni-text-color-grey;
    font-size: $uni-font-size-sm;
  }

  &__value {
    flex: 1;
    text-align: right;
    font-size: $uni-font-size-sm;
    word-break: break-all;
  }

  &--stack &__value {
    margin-top: 6rpx;
    text-align: left;
    color: $uni-text-color-grey;
  }
}

.bullet {
  display: flex;
  margin-bottom: $uni-spacing-col-sm;

  &__dot {
    margin-right: $uni-spacing-row-sm;
    color: $uni-color-primary;
  }

  &__text {
    flex: 1;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
  }
}

.btn {
  margin: $uni-spacing-col-sm 0;
}

.list {
  margin-top: $uni-spacing-col-sm;

  &__item {
    padding: $uni-spacing-col-base 0;
    border-bottom: 1rpx solid $uni-border-color;
  }

  &__title {
    display: block;
    font-size: $uni-font-size-base;
  }

  &__desc {
    display: block;
    margin-top: 6rpx;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
  }
}

.error {
  display: block;
  margin-top: $uni-spacing-col-sm;
  font-size: $uni-font-size-sm;
  color: $uni-color-error;
}
</style>
