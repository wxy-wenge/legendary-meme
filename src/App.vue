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

/* 页面最外层容器，各页面统一用它拿到左右留白 */
.page {
  min-height: 100vh;
  padding: $uni-spacing-row-base;
}

.text-muted {
  color: $uni-text-color-grey;
}
</style>
