<template>
  <view class="paper-page">
    <view class="deco">
      <view class="deco__glow"></view>
      <view class="deco__ring deco__ring--sm"></view>
      <view class="deco__ring deco__ring--lg"></view>
    </view>

    <view class="todo paper-content">
      <text class="todo__title">意见反馈</text>
      <text class="todo__desc">反馈内容提交与历史记录</text>

      <view class="ph todo__ph">
        <text class="ph__text">内容区占位 · 待实现</text>
      </view>

      <text class="todo__path">src/pages-sub/user/feedback.vue</text>
    </view>
  </view>
</template>

<script setup lang="ts">
// 意见反馈 —— 骨架页，待实现：反馈内容提交与历史记录
</script>

<style lang="scss" scoped>
@import '../../styles/skeleton.scss';

.todo {
  padding: 64rpx 48rpx 0;
}

.todo__title {
  font-size: 44rpx;
  font-weight: 600;
  color: $ink;
}

.todo__desc {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: $warm-gray;
}

.todo__ph {
  height: 320rpx;
  margin-top: 40rpx;
}

.todo__path {
  display: block;
  margin-top: 24rpx;
  font-size: 22rpx;
  color: rgba(138, 129, 124, 0.7);
}
</style>
