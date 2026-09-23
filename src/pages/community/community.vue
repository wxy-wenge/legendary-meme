<template>
  <view class="paper-page">
    <view class="deco">
      <view class="deco__glow"></view>
      <view class="deco__ring deco__ring--sm"></view>
      <view class="deco__ring deco__ring--lg"></view>
      <view class="deco__arc deco__arc--a"></view>
      <view class="deco__note"></view>
    </view>

    <view class="community paper-content">
      <view class="sec">
        <text class="sec__title">话题广场</text>
        <text class="sec__more" @click="goTopic">全部 ›</text>
      </view>

      <scroll-view class="community__topics" scroll-x :show-scrollbar="false">
        <view class="community__topics-inner">
          <text
            v-for="(item, index) in topics"
            :key="item"
            class="community__topic"
            :class="{ 'community__topic--on': index === activeTopic }"
            @click="activeTopic = index"
          >
            {{ item }}
          </text>
        </view>
      </scroll-view>

      <view class="sec">
        <text class="sec__title">最新帖子</text>
        <text class="sec__more" @click="goCreate">发帖 ›</text>
      </view>

      <view class="community__list">
        <view v-for="n in 3" :key="n" class="ph community__post" @click="goPostDetail">
          <text class="ph__text">
            帖子卡片占位 {{ n }} · 头像 / 昵称 / 摘要 / 图片 / 点赞评论数
          </text>
        </view>
      </view>

      <!-- 发帖入口：先做成页内悬浮按钮，tabBar 中间凸起按钮后置 -->
      <view class="community__fab" @click="goCreate">
        <text class="community__fab-icon">＋</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/** 话题标签：产品框架里举的例子，最终以后端返回为准 */
const topics = ['全部', '#今日学习打卡', '#求大佬解答', '#前端打卡', '#算法刷题']
const activeTopic = ref(0)

function goTopic(): void {
  uni.navigateTo({ url: '/pages-sub/community/topic' })
}

function goCreate(): void {
  uni.navigateTo({ url: '/pages-sub/community/post-create' })
}

function goPostDetail(): void {
  uni.navigateTo({ url: '/pages-sub/community/post-detail' })
}
</script>

<style lang="scss" scoped>
@import '../../styles/skeleton.scss';

.community {
  padding: 24rpx 32rpx 160rpx;
}

.community__topics {
  white-space: nowrap;
}

.community__topics-inner {
  display: inline-flex;
  align-items: center;
}

.community__topic {
  margin-right: 24rpx;
  padding: 10rpx 24rpx;
  font-size: 26rpx;
  color: $warm-gray;
  background-color: rgba(255, 252, 246, 0.8);
  border: 2rpx solid rgba(24, 58, 55, 0.1);
  border-radius: 28rpx;
}

.community__topic--on {
  color: #fffcf6;
  background-color: $ink;
  border-color: $ink;
}

.community__post {
  height: 240rpx;
  margin-bottom: 24rpx;
}

.community__fab {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104rpx;
  height: 104rpx;
  background-color: $ink;
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(24, 58, 55, 0.24);
}

.community__fab-icon {
  font-size: 52rpx;
  line-height: 1;
  color: #fffcf6;
}
</style>
