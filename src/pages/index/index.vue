<template>
  <view class="paper-page">
    <view class="deco">
      <view class="deco__glow"></view>
      <view class="deco__progress"></view>
      <view class="deco__ring deco__ring--sm"></view>
      <view class="deco__rule"></view>
      <view class="deco__ring deco__ring--lg"></view>
      <view class="deco__plant">
        <view class="deco__plant-stem"></view>
        <view class="deco__leaf deco__leaf--a"></view>
        <view class="deco__leaf deco__leaf--b"></view>
      </view>
      <view class="deco__book">
        <view class="deco__book-page deco__book-page--l"></view>
        <view class="deco__book-page deco__book-page--r"></view>
      </view>
    </view>

    <view class="home paper-content">
      <!-- 顶部搜索 -->
      <view class="home__search" @click="goSearch">
        <text class="home__search-ph">搜索文章、视频、帖子</text>
      </view>

      <!-- 轮播 Banner：广告位 / 热门活动 / 精选课程 -->
      <swiper class="home__banner" :autoplay="false" :circular="true" :indicator-dots="false">
        <swiper-item v-for="n in 3" :key="n">
          <view class="ph home__banner-item">
            <text class="ph__text">轮播 Banner {{ n }} · 广告位 / 活动 / 精选课程</text>
          </view>
        </swiper-item>
      </swiper>

      <!-- 分类标签 -->
      <scroll-view class="home__cats" scroll-x :show-scrollbar="false">
        <view class="home__cats-inner">
          <text
            v-for="(item, index) in categories"
            :key="item"
            class="home__cat"
            :class="{ 'home__cat--on': index === activeCat }"
            @click="activeCat = index"
          >
            {{ item }}
          </text>
        </view>
      </scroll-view>

      <!-- 信息流：文章卡片 + 视频卡片混排 -->
      <view class="sec">
        <text class="sec__title">{{ categories[activeCat] }}</text>
        <text class="sec__more" @click="goSearch">全部 ›</text>
      </view>

      <view class="home__feed">
        <view v-for="n in 3" :key="n" class="ph home__feed-item">
          <text class="ph__text">内容卡片占位 {{ n }} · 封面 / 标题 / 作者 / 点赞量</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/** 分类标签：产品框架里定的，最终以后端返回为准 */
const categories = ['推荐', '前端', '后端', '人工智能', '移动开发', '算法']
const activeCat = ref(0)

function goSearch(): void {
  uni.navigateTo({ url: '/pages-sub/content/search' })
}
</script>

<style lang="scss" scoped>
@import '../../styles/skeleton.scss';

.home {
  padding: 24rpx 32rpx 40rpx;
}

.home__search {
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 28rpx;
  background-color: rgba(255, 252, 246, 0.9);
  border: 2rpx solid rgba(24, 58, 55, 0.12);
  border-radius: 36rpx;
}

.home__search-ph {
  font-size: 26rpx;
  color: $warm-gray;
}

.home__banner {
  height: 280rpx;
  margin-top: 28rpx;
}

.home__banner-item {
  height: 100%;
}

.home__cats {
  margin-top: 32rpx;
  white-space: nowrap;
}

.home__cats-inner {
  display: inline-flex;
  align-items: center;
}

.home__cat {
  margin-right: 36rpx;
  padding-bottom: 8rpx;
  font-size: 30rpx;
  color: $warm-gray;
  border-bottom: 4rpx solid transparent;
}

.home__cat--on {
  font-weight: 600;
  color: $ink;
  border-bottom-color: $coral;
}

.home__feed-item {
  height: 220rpx;
  margin-bottom: 24rpx;
}
</style>
