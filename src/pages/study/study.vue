<template>
  <view class="paper-page">
    <view class="deco">
      <view class="deco__glow"></view>
      <view class="deco__progress"></view>
      <view class="deco__ring deco__ring--lg"></view>
      <view class="deco__plant">
        <view class="deco__plant-stem"></view>
        <view class="deco__leaf deco__leaf--a"></view>
        <view class="deco__leaf deco__leaf--b"></view>
      </view>
      <view class="deco__pencil">
        <view class="deco__pencil-lead"></view>
      </view>
    </view>

    <view class="study paper-content">
      <view class="sec">
        <text class="sec__title">继续学习</text>
      </view>

      <view class="ph study__resume">
        <text class="ph__text">最近观看 / 最近阅读占位 · 带进度</text>
      </view>

      <view class="study__entries">
        <view v-for="item in entries" :key="item.url" class="study__entry" @click="go(item.url)">
          <text class="study__entry-title">{{ item.title }}</text>
          <text class="study__entry-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Entry {
  title: string
  desc: string
  url: string
}

const entries: Entry[] = [
  { title: '观看历史', desc: '视频进度与文章阅读记录', url: '/pages-sub/study/history' },
  { title: '我的收藏', desc: '收藏的文章与视频', url: '/pages-sub/study/favorite' },
  { title: '我的书架', desc: '关注的专栏与订阅的课程', url: '/pages-sub/study/shelf' }
]

function go(url: string): void {
  uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
@import '../../styles/skeleton.scss';

.study {
  padding: 24rpx 32rpx 40rpx;
}

.study__resume {
  height: 200rpx;
}

.study__entries {
  margin-top: 32rpx;
}

.study__entry {
  padding: 32rpx 28rpx;
  margin-bottom: 24rpx;
  background-color: rgba(255, 252, 246, 0.86);
  border: 2rpx solid rgba(24, 58, 55, 0.1);
  border-radius: 16rpx;
}

.study__entry-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $ink;
}

.study__entry-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: $warm-gray;
}
</style>
