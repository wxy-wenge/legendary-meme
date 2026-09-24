<template>
  <view class="paper-page"></view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { goMineTab, MINE_TAB } from '@/utils/mine-tab'

// 观看历史
// 这个页面已经并入「我的」页内 Tab，路由先保留，进来就跳过去。
onLoad(() => {
  goMineTab(MINE_TAB.history)
})
</script>
