<template>
  <view class="detail">
    <view v-if="loading" class="tip">
      <text class="tip__text">加载中…</text>
    </view>

    <view v-else-if="failed" class="tip">
      <text class="tip__text">没有找到这门课程</text>
    </view>

    <template v-else>
      <!-- 封面：渐变占位 + 返回 / 收藏 -->
      <view class="cover" :style="{ background: course.cover }">
        <text class="cover__emoji">{{ course.emoji }}</text>

        <view
          class="cover__bar"
          :style="{ paddingTop: statusBarHeight + 'px', paddingRight: capsuleRight + 'px' }"
        >
          <view class="cover__btn" @click="goBack">
            <view class="back"></view>
          </view>

          <view class="cover__btn cover__btn--right" @click="toggleFav">
            <view class="bm" :class="faved ? 'bm--accent' : 'bm--white'">
              <view class="bm__body"></view>
              <view class="bm__tip"></view>
            </view>
          </view>
        </view>
      </view>

      <view class="body" :style="{ paddingBottom: actionBarHeight + 'px' }">
        <!-- 标题区 -->
        <view class="head">
          <text class="head__title">{{ course.title }}</text>

          <view class="head__meta">
            <text class="head__author">{{ course.author }}</text>
            <text class="head__sep">·</text>
            <text class="head__type">{{ course.subtitle }}</text>
          </view>

          <view class="head__stat">
            <view class="stars">
              <text
                v-for="n in 5"
                :key="n"
                class="stars__item"
                :class="{ 'stars__item--on': n <= course.stars }"
              >
                ★
              </text>
            </view>
            <text class="head__score">{{ course.score }}</text>
            <text class="head__learners">{{ course.learners }} 人在学</text>
          </view>
        </view>

        <!-- 三个 Tab -->
        <view class="tabs">
          <view
            v-for="(item, index) in tabs"
            :key="item"
            class="tabs__item"
            :class="{ 'tabs__item--on': index === active }"
            @click="active = index"
          >
            <text class="tabs__text">{{ item }}</text>
          </view>
        </view>

        <view class="panel">
          <!-- 简介 -->
          <view v-if="active === 0">
            <text class="panel__label">课程介绍</text>
            <text class="panel__text">{{ course.intro }}</text>

            <text class="panel__label panel__label--gap">你将学到</text>
            <view class="learn">
              <view v-for="item in course.outcomes" :key="item" class="learn__item">
                <view class="learn__tick">
                  <view class="learn__tick-mark"></view>
                </view>
                <text class="learn__text">{{ item }}</text>
              </view>
            </view>
          </view>

          <!-- 目录 -->
          <view v-else-if="active === 1">
            <view v-for="(chapter, index) in course.chapters" :key="chapter.title" class="chapter">
              <view class="chapter__head" @click="toggleChapter(index)">
                <view class="chapter__main">
                  <text class="chapter__title">{{ chapter.title }}</text>
                  <text class="chapter__meta">
                    {{ chapter.lessons.length }} 课时 · {{ chapter.duration }}
                  </text>
                </view>
                <text
                  class="chapter__arrow"
                  :class="{ 'chapter__arrow--open': openChapters.includes(index) }"
                >
                  ›
                </text>
              </view>

              <view v-if="openChapters.includes(index)" class="chapter__body">
                <view v-for="lesson in chapter.lessons" :key="lesson.title" class="lesson">
                  <text class="lesson__title">{{ lesson.title }}</text>
                  <text class="lesson__time">{{ lesson.time }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 评价 -->
          <view v-else>
            <view class="score">
              <text class="score__num">{{ course.score }}</text>
              <text class="score__label">综合评分</text>
              <view class="stars">
                <text
                  v-for="n in 5"
                  :key="n"
                  class="stars__item stars__item--lg"
                  :class="{ 'stars__item--on': n <= course.stars }"
                >
                  ★
                </text>
              </view>
            </view>

            <view class="dist">
              <view v-for="row in course.distribution" :key="row.star" class="dist__row">
                <text class="dist__star">{{ row.star }} 星</text>
                <view class="dist__track">
                  <view class="dist__fill" :style="{ width: row.percent + '%' }"></view>
                </view>
                <text class="dist__pct">{{ row.percent }}%</text>
              </view>
            </view>

            <view class="reviews">
              <view v-for="item in course.reviews" :key="item.name" class="review">
                <view class="review__avatar">
                  <text class="review__letter">{{ item.name.slice(0, 1) }}</text>
                </view>

                <view class="review__body">
                  <view class="review__top">
                    <text class="review__name">{{ item.name }}</text>
                    <text class="review__time">{{ item.time }}</text>
                  </view>

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

                  <text class="review__text">{{ item.content }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="actionbar" :style="{ paddingBottom: safeBottom + 'px' }">
        <view class="actionbar__item" @click="toggleFav">
          <view class="bm" :class="faved ? 'bm--on' : 'bm--off'">
            <view class="bm__body"></view>
            <view class="bm__tip"></view>
          </view>
          <text class="actionbar__label">收藏</text>
        </view>

        <view class="actionbar__item" @click="onShare">
          <view class="share">
            <view class="share__box"></view>
            <view class="share__arrow"></view>
            <view class="share__stem"></view>
          </view>
          <text class="actionbar__label">分享</text>
        </view>

        <button class="actionbar__main" @click="onLearn">立即学习</button>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { contentApi } from '@/api/modules/content'
import type { CourseDetail } from '@/api/types'

const course = ref<CourseDetail>({
  id: 0,
  title: '',
  type: 'article',
  category: '',
  emoji: '',
  cover: '',
  stars: 0,
  score: '0',
  learners: '0',
  author: '',
  subtitle: '',
  intro: '',
  outcomes: [],
  chapters: [],
  distribution: [],
  reviews: []
})

const loading = ref(true)
const failed = ref(false)

const tabs = ['简介', '目录', '评价']
const active = ref(0)

/** 默认展开第一章，其余收起 */
const openChapters = ref<number[]>([0])

const faved = ref(false)

/* ---------- 自定义导航栏尺寸 ---------- */

const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = sysInfo.statusBarHeight ?? 0

/** 封面按钮要避开微信右上角胶囊 */
let capsuleRight = 24
// #ifdef MP-WEIXIN
const menuRect = uni.getMenuButtonBoundingClientRect()
if (menuRect && menuRect.width) {
  capsuleRight = (sysInfo.windowWidth || 0) - menuRect.left + 8
}
// #endif

/** 底部安全区（全面屏底部横条） */
const safeBottom = sysInfo.safeAreaInsets?.bottom ?? 0

/** 内容要给底部操作栏让位：按钮 88rpx + 上下内边距 ≈ 60px，再加安全区 */
const actionBarHeight = 60 + safeBottom

/* ---------- 数据 ---------- */

async function loadDetail(id: number): Promise<void> {
  loading.value = true
  failed.value = false
  try {
    course.value = await contentApi.detail(id)
  } catch {
    // 失败提示由 request 层统一 toast
    failed.value = true
  } finally {
    loading.value = false
  }
}

onLoad((options) => {
  const id = Number((options as Record<string, string> | undefined)?.id ?? 0)
  void loadDetail(id)
})

/* ---------- 交互 ---------- */

function toggleChapter(index: number): void {
  const list = openChapters.value
  openChapters.value = list.includes(index)
    ? list.filter((item) => item !== index)
    : [...list, index]
}

function toggleFav(): void {
  faved.value = !faved.value
  uni.showToast({ title: faved.value ? '已收藏' : '已取消收藏', icon: 'none' })
}

function goBack(): void {
  uni.navigateBack({
    fail: () => {
      // 直接打开这一页时栈里没有上一页，退回首页
      uni.switchTab({ url: '/pages/index/index' })
    }
  })
}

function onShare(): void {
  uni.showToast({ title: '小程序请用右上角菜单分享', icon: 'none' })
}

function onLearn(): void {
  uni.showToast({ title: '课程播放待接口接入', icon: 'none' })
}
</script>

<style lang="scss" scoped>
@import '../../styles/book-theme.scss';

.detail {
  min-height: 100vh;
  background-color: $bg;
}

/* ---------- 封面 ---------- */

.cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 520rpx;
}

.cover__emoji {
  font-size: 160rpx;
  line-height: 1;
}

.cover__bar {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding-left: 24rpx;
}

.cover__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  background-color: rgba(0, 0, 0, 0.18);
  border-radius: 50%;
}

/* 返回箭头 */
.back {
  width: 20rpx;
  height: 20rpx;
  margin-left: 6rpx;
  border-bottom: 4rpx solid #ffffff;
  border-left: 4rpx solid #ffffff;
  transform: rotate(45deg);
}

/* ---------- 书签图标（收藏）---------- */

.bm {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bm__body {
  width: 24rpx;
  height: 22rpx;
  border-radius: 4rpx 4rpx 0 0;
}

.bm__tip {
  width: 0;
  height: 0;
  border-right: 12rpx solid transparent;
  border-left: 12rpx solid transparent;
  border-top: 10rpx solid;
}

.bm--white {
  .bm__body {
    background-color: #ffffff;
  }

  .bm__tip {
    border-top-color: #ffffff;
  }
}

.bm--accent {
  .bm__body {
    background-color: $accent;
  }

  .bm__tip {
    border-top-color: $accent;
  }
}

.bm--off {
  .bm__body {
    background-color: $text-3;
  }

  .bm__tip {
    border-top-color: $text-3;
  }
}

.bm--on {
  .bm__body {
    background-color: $primary;
  }

  .bm__tip {
    border-top-color: $primary;
  }
}

/* ---------- 主体 ---------- */

.body {
  position: relative;
  margin-top: -32rpx;
  padding: 0 32rpx;
  background-color: $bg;
  border-radius: 32rpx 32rpx 0 0;
}

.head {
  padding-top: 44rpx;
}

.head__title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1.4;
  color: $text;
}

.head__meta {
  display: flex;
  align-items: center;
  margin-top: 18rpx;
}

.head__author {
  font-size: 26rpx;
  color: $text-2;
}

.head__sep {
  margin: 0 10rpx;
  font-size: 24rpx;
  color: $text-3;
}

.head__type {
  font-size: 26rpx;
  color: $text-3;
}

.head__stat {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}

.stars {
  display: flex;
  align-items: center;
}

.stars__item {
  margin-right: 3rpx;
  font-size: 24rpx;
  line-height: 1;
  color: #e5e7eb;
}

.stars__item--lg {
  font-size: 30rpx;
  margin-right: 6rpx;
}

.stars__item--on {
  color: $primary;
}

.head__score {
  margin-left: 8rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: $primary;
}

.head__learners {
  margin-left: auto;
  font-size: 24rpx;
  color: $text-3;
}

/* ---------- Tab ---------- */

.tabs {
  display: flex;
  align-items: center;
  margin-top: 40rpx;
}

.tabs__item {
  padding-bottom: 12rpx;
  margin-right: 44rpx;
  border-bottom: 6rpx solid transparent;
}

.tabs__item--on {
  border-bottom-color: $primary;
}

.tabs__text {
  font-size: 30rpx;
  color: $text-2;
}

.tabs__item--on .tabs__text {
  font-weight: 600;
  color: $text;
}

/* ---------- 面板 ---------- */

.panel {
  padding: 40rpx 0 60rpx;
}

.panel__label {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $text;
}

.panel__label--gap {
  margin-top: 44rpx;
}

.panel__text {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  line-height: 1.9;
  color: $text-2;
}

/* ---------- 你将学到 ---------- */

.learn {
  margin-top: 20rpx;
}

.learn__item {
  display: flex;
  align-items: flex-start;
  padding: 18rpx 0;
}

.learn__tick {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 34rpx;
  height: 34rpx;
  margin-top: 4rpx;
  background-color: rgba(37, 99, 235, 0.1);
  border-radius: 50%;
}

.learn__tick-mark {
  width: 14rpx;
  height: 8rpx;
  margin-top: -3rpx;
  border-bottom: 3rpx solid $primary;
  border-left: 3rpx solid $primary;
  transform: rotate(-45deg);
}

.learn__text {
  flex: 1;
  margin-left: 18rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: $text;
}

/* ---------- 目录 ---------- */

.chapter {
  margin-bottom: 20rpx;
  overflow: hidden;
  background-color: $card;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.chapter__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
}

.chapter__main {
  flex: 1;
  overflow: hidden;
}

.chapter__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $text;
}

.chapter__meta {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: $text-3;
}

.chapter__arrow {
  flex-shrink: 0;
  margin-left: 16rpx;
  font-size: 36rpx;
  line-height: 1;
  color: $text-3;
  transition: transform 0.2s;
}

.chapter__arrow--open {
  transform: rotate(90deg);
}

.chapter__body {
  padding: 0 28rpx 12rpx;
}

.lesson {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 0;
  border-top: 2rpx solid #f3f4f6;
}

.lesson__title {
  flex: 1;
  font-size: 27rpx;
  color: $text-2;
}

.lesson__time {
  flex-shrink: 0;
  margin-left: 16rpx;
  font-size: 24rpx;
  color: $text-3;
}

/* ---------- 评价 ---------- */

.score {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  background-color: $card;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.score__num {
  font-size: 84rpx;
  font-weight: 700;
  line-height: 1;
  color: $primary;
}

.score__label {
  margin: 14rpx 0 18rpx;
  font-size: 24rpx;
  color: $text-3;
}

.dist {
  padding: 28rpx 0 8rpx;
}

.dist__row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.dist__star {
  width: 70rpx;
  font-size: 24rpx;
  color: $text-3;
}

.dist__track {
  flex: 1;
  height: 12rpx;
  overflow: hidden;
  background-color: #eef2f7;
  border-radius: 6rpx;
}

.dist__fill {
  height: 100%;
  background-color: $primary;
  border-radius: 6rpx;
}

.dist__pct {
  width: 72rpx;
  font-size: 24rpx;
  color: $text-3;
  text-align: right;
}

.reviews {
  margin-top: 24rpx;
}

.review {
  display: flex;
  padding: 28rpx;
  margin-bottom: 20rpx;
  background-color: $card;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.review__avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  background-color: $primary;
  border-radius: 50%;
}

.review__letter {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}

.review__body {
  flex: 1;
  margin-left: 20rpx;
  overflow: hidden;
}

.review__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.review__name {
  font-size: 28rpx;
  font-weight: 600;
  color: $text;
}

.review__time {
  font-size: 22rpx;
  color: $text-3;
}

.review__text {
  display: block;
  margin-top: 14rpx;
  font-size: 27rpx;
  line-height: 1.7;
  color: $text-2;
}

/* ---------- 底部操作栏 ---------- */

.actionbar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  padding: 16rpx 32rpx;
  background-color: $card;
  box-shadow: 0 -8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.actionbar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  margin-right: 24rpx;
}

.actionbar__label {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: $text-2;
}

/* 分享图标：方框 + 向上箭头 */
.share {
  position: relative;
  width: 34rpx;
  height: 34rpx;
}

.share__box {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 34rpx;
  height: 22rpx;
  border: 3rpx solid $text-2;
  border-radius: 6rpx;
}

.share__arrow {
  position: absolute;
  top: 0;
  left: 50%;
  width: 0;
  height: 0;
  margin-left: -8rpx;
  border-right: 8rpx solid transparent;
  border-bottom: 9rpx solid $text-2;
  border-left: 8rpx solid transparent;
}

.share__stem {
  position: absolute;
  top: 6rpx;
  left: 50%;
  width: 3rpx;
  height: 12rpx;
  margin-left: -1.5rpx;
  background-color: $text-2;
}

.actionbar__main {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  letter-spacing: 4rpx;
  color: #ffffff;
  background-color: $primary;
  border-radius: 999rpx;
}

.actionbar__main::after {
  border: none;
}
/* ---------- 状态提示 ---------- */

.tip {
  padding: 200rpx 0;
  text-align: center;
}

.tip__text {
  font-size: 26rpx;
  color: $text-3;
}
</style>
