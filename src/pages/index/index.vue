<template>
  <view class="page">
    <view class="placeholder">
      <text class="placeholder__title">首页</text>
      <text class="placeholder__desc">这里还是空的，开始写你的内容吧</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;

  &__title {
    font-size: 40rpx;
    font-weight: 600;
  }

  &__desc {
    margin-top: $uni-spacing-col-base;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
  }
}
</style>
