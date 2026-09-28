<template>
  <view class="home">
    <!-- 顶部导航（自定义导航栏，原生导航栏放不下汉堡和铃铛） -->
    <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav__inner" :style="{ paddingRight: capsuleRight + 'px' }">
        <view class="nav__btn">
          <view class="menu">
            <view class="menu__bar"></view>
            <view class="menu__bar"></view>
            <view class="menu__bar"></view>
          </view>
        </view>

        <text class="nav__title">首页</text>

        <view class="nav__btn nav__btn--bell">
          <view class="bell">
            <view class="bell__dome"></view>
            <view class="bell__rim"></view>
            <view class="bell__clapper"></view>
          </view>
          <view class="nav__dot"></view>
        </view>
      </view>
    </view>

    <view class="body" :style="{ paddingTop: contentTop + 'px' }">
      <!-- 搜索 -->
      <view class="search" @click="goSearch">
        <text class="search__ph">你想学点什么？</text>
        <view class="search__icon">
          <view class="search__glass"></view>
          <view class="search__handle"></view>
        </view>
      </view>

      <!-- 分类 -->
      <scroll-view class="cats" scroll-x :show-scrollbar="false">
        <view class="cats__inner">
          <text
            v-for="(item, index) in categories"
            :key="item"
            class="cats__item"
            :class="{ 'cats__item--on': index === activeCat }"
            @click="onCategory(index)"
          >
            {{ item }}
          </text>
        </view>
      </scroll-view>

      <!-- Banner：广告 / 活动位 -->
      <view v-if="bannerVisible && banners.length" class="banner-wrap">
        <swiper
          class="banner"
          :circular="true"
          :autoplay="true"
          :interval="4000"
          :duration="400"
          :indicator-dots="true"
          indicator-color="rgba(255, 255, 255, 0.45)"
          indicator-active-color="#FFFFFF"
        >
          <swiper-item v-for="item in banners" :key="item.id">
            <view class="banner__item" :style="{ background: item.bg }">
              <text class="banner__title">{{ item.title }}</text>
              <text class="banner__sub">{{ item.sub }}</text>
            </view>
          </swiper-item>
        </swiper>

        <view class="banner__close" @click="closeBanner">
          <text class="banner__close-icon">×</text>
        </view>
      </view>

      <!-- 板块标题 -->
      <view class="sec">
        <text class="sec__title">热门推荐</text>
        <text class="sec__more">查看全部 ›</text>
      </view>

      <view v-if="!loading && !courses.length" class="home__tip">
        <text class="home__tip-text">这个分类下还没有内容</text>
      </view>

      <!-- 双列课程卡片 -->
      <view class="grid">
        <view v-for="item in courses" :key="item.id" class="card" @click="goDetail(item.id)">
          <view class="card__cover" :style="{ background: item.cover }">
            <text class="card__emoji">{{ item.emoji }}</text>

            <view class="card__bookmark">
              <view class="card__bookmark-body"></view>
              <view class="card__bookmark-tip"></view>
            </view>

            <view v-if="item.type === 'video'" class="card__play">
              <view class="card__play-tri"></view>
            </view>
          </view>

          <view class="card__body">
            <text class="card__title">{{ item.title }}</text>

            <view class="card__meta">
              <view class="stars">
                <text
                  v-for="n in 5"
                  :key="n"
                  class="stars__item"
                  :class="{ 'stars__item--on': n <= item.stars }"
                >
                  ★
                </text>
              </view>
              <text class="card__score">{{ item.score }}</text>
              <text class="card__learners">{{ item.learners }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { contentApi } from '@/api/modules/content'
import type { BannerItem, CourseItem } from '@/api/types'

/* ---------- 顶部导航尺寸 ---------- */

const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = sysInfo.statusBarHeight ?? 0

/** 导航栏内容区高度，与微信胶囊保持同一水平线 */
const NAV_INNER_HEIGHT = 44

const contentTop = statusBarHeight + NAV_INNER_HEIGHT

/** 微信端右上角有胶囊按钮，铃铛必须排在它左边，否则会被盖住 */
let capsuleRight = 24
// #ifdef MP-WEIXIN
const menuRect = uni.getMenuButtonBoundingClientRect()
if (menuRect && menuRect.width) {
  capsuleRight = (sysInfo.windowWidth || 0) - menuRect.left + 8
}
// #endif

/* ---------- 分类 ---------- */

const categories = ['推荐', '前端', '后端', '人工智能', '移动开发', '设计', '产品']
const activeCat = ref(0)

/* ---------- 数据 ---------- */

const banners = ref<BannerItem[]>([])
const courses = ref<CourseItem[]>([])
const loading = ref(true)

const bannerVisible = ref(true)

function closeBanner(): void {
  bannerVisible.value = false
}

async function loadBanners(): Promise<void> {
  try {
    banners.value = await contentApi.banners()
  } catch {
    // 失败提示由 request 层统一 toast
    banners.value = []
  }
}

async function loadCourses(): Promise<void> {
  loading.value = true
  try {
    const res = await contentApi.courses({ category: categories[activeCat.value] })
    courses.value = res.rows ?? []
  } catch {
    // 失败提示由 request 层统一 toast
    courses.value = []
  } finally {
    loading.value = false
  }
}

/* ---------- 跳转 ---------- */

function onCategory(index: number): void {
  if (index === activeCat.value) return
  activeCat.value = index
  void loadCourses()
}

function goSearch(): void {
  uni.navigateTo({ url: '/pages-sub/content/search' })
}

function goDetail(id: number): void {
  uni.navigateTo({ url: `/pages-sub/content/detail?id=${id}` })
}

onLoad(() => {
  void loadBanners()
  void loadCourses()
})
</script>

<style lang="scss" scoped>
/* 本页独立配色，不动全局主题 */
$bg: #f5f7fb;
$primary: #2563eb;
$card: #ffffff;
$text: #1f2937;
$text-sub: #6b7280;
$text-hint: #9ca3af;
$shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);

.home {
  min-height: 100vh;
  background-color: $bg;
}

/* ---------- 顶部导航 ---------- */

.nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
  background-color: $bg;
}

.nav__inner {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding-left: 24rpx;
}

.nav__title {
  margin-left: 24rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: $text;
}

.nav__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
}

.nav__btn--bell {
  position: relative;
  margin-left: auto;
}

/* 汉堡：三条杠用 CSS 画，比字符干净 */
.menu {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 34rpx;
  height: 24rpx;
}

.menu__bar {
  width: 100%;
  height: 4rpx;
  background-color: $text;
  border-radius: 2rpx;
}

/* 铃铛 */
.bell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bell__dome {
  width: 28rpx;
  height: 24rpx;
  background-color: $text;
  border-radius: 14rpx 14rpx 3rpx 3rpx;
}

.bell__rim {
  width: 36rpx;
  height: 4rpx;
  margin-top: 2rpx;
  background-color: $text;
  border-radius: 2rpx;
}

.bell__clapper {
  width: 8rpx;
  height: 8rpx;
  margin-top: 2rpx;
  background-color: $text;
  border-radius: 50%;
}

.nav__dot {
  position: absolute;
  top: 10rpx;
  right: 12rpx;
  width: 14rpx;
  height: 14rpx;
  background-color: #ef4444;
  border: 2rpx solid $bg;
  border-radius: 50%;
}

/* ---------- 页面主体 ---------- */

.body {
  padding-right: 24rpx;
  padding-bottom: 40rpx;
  padding-left: 24rpx;
}

/* ---------- 搜索 ---------- */

.search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72rpx;
  padding: 0 28rpx;
  background-color: $card;
  border-radius: 999rpx;
  box-shadow: $shadow;
}

.search__ph {
  font-size: 26rpx;
  color: $text-hint;
}

/* 放大镜 */
.search__icon {
  position: relative;
  width: 32rpx;
  height: 32rpx;
}

.search__glass {
  width: 24rpx;
  height: 24rpx;
  border: 3rpx solid $text-hint;
  border-radius: 50%;
}

.search__handle {
  position: absolute;
  right: 0;
  bottom: 2rpx;
  width: 12rpx;
  height: 3rpx;
  background-color: $text-hint;
  border-radius: 2rpx;
  transform: rotate(45deg);
}

/* ---------- 分类 ---------- */

.cats {
  margin-top: 24rpx;
  white-space: nowrap;
}

.cats__inner {
  display: inline-flex;
  align-items: center;
}

.cats__item {
  padding: 12rpx 28rpx;
  margin-right: 16rpx;
  font-size: 26rpx;
  color: $text-sub;
  background-color: $card;
  border-radius: 999rpx;
}

.cats__item--on {
  color: #ffffff;
  background-color: $primary;
}

/* ---------- Banner ---------- */

.banner-wrap {
  position: relative;
  margin-top: 28rpx;
}

.banner {
  height: 280rpx;
  overflow: hidden;
  border-radius: 24rpx;
}

.banner__item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 0 40rpx;
}

.banner__title {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
}

.banner__sub {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

.banner__close {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  background-color: rgba(0, 0, 0, 0.18);
  border-radius: 50%;
}

.banner__close-icon {
  font-size: 32rpx;
  line-height: 1;
  color: #ffffff;
}

/* ---------- 板块标题 ---------- */

.sec {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 44rpx 0 24rpx;
}

.sec__title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text;
}

.sec__more {
  font-size: 24rpx;
  color: $text-hint;
}

/* ---------- 状态提示 ---------- */

.home__tip {
  padding: 100rpx 0;
  text-align: center;
}

.home__tip-text {
  font-size: 26rpx;
  color: $text-hint;
}

/* ---------- 双列卡片 ---------- */

.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.card {
  width: calc((100% - 20rpx) / 2);
  margin-bottom: 20rpx;
  overflow: hidden;
  background-color: $card;
  border-radius: 20rpx;
  box-shadow: $shadow;
}

.card__cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 280rpx;
}

.card__emoji {
  font-size: 96rpx;
  line-height: 1;
}

/* 收藏书签：白底 + 下方尖角 */
.card__bookmark {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
}

.card__bookmark-body {
  width: 26rpx;
  height: 26rpx;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 4rpx 4rpx 0 0;
}

.card__bookmark-tip {
  width: 0;
  height: 0;
  border-top: 11rpx solid rgba(255, 255, 255, 0.95);
  border-right: 13rpx solid transparent;
  border-left: 13rpx solid transparent;
}

/* 视频课：右下角小播放角标。
   放角上而不是居中，免得压住封面图标；换成真实封面图之后这个位置依然成立 */
.card__play {
  position: absolute;
  right: 16rpx;
  bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.card__play-tri {
  width: 0;
  height: 0;
  margin-left: 5rpx;
  border-top: 9rpx solid transparent;
  border-bottom: 9rpx solid transparent;
  border-left: 14rpx solid $primary;
}

.card__body {
  padding: 20rpx;
}

.card__title {
  display: -webkit-box;
  min-height: 78rpx;
  overflow: hidden;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
  color: $text;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.card__meta {
  display: flex;
  align-items: center;
  margin-top: 14rpx;
}

.stars {
  display: flex;
  align-items: center;
}

.stars__item {
  margin-right: 2rpx;
  font-size: 20rpx;
  line-height: 1;
  color: #e5e7eb;
}

.stars__item--on {
  color: $primary;
}

.card__score {
  margin-left: 6rpx;
  font-size: 22rpx;
  color: $text-sub;
}

.card__learners {
  margin-left: auto;
  font-size: 22rpx;
  color: $text-hint;
}
</style>
