<template>
  <view class="paper-page">
    <view class="page paper-content">
      <!-- 搜索框 -->
      <view class="bar">
        <view class="bar__icon">
          <view class="bar__glass"></view>
          <view class="bar__handle"></view>
        </view>
        <input
          v-model="keyword"
          class="bar__input"
          type="text"
          placeholder="搜索课程 / 书籍"
          placeholder-class="bar__ph"
          confirm-type="search"
          :focus="autoFocus"
          :maxlength="30"
          @confirm="onConfirm"
        />
      </view>

      <!-- 还没搜索：历史 + 热门 -->
      <template v-if="!searched">
        <view v-if="history.length" class="block">
          <view class="block__head">
            <text class="block__title">历史搜索</text>
            <text class="block__more" @click="clearHistory">清空</text>
          </view>
          <view class="chips">
            <view v-for="(item, index) in history" :key="item" class="chip">
              <text class="chip__text" @click="doSearch(item)">{{ item }}</text>
              <text class="chip__close" @click.stop="removeHistory(index)">×</text>
            </view>
          </view>
        </view>

        <view class="block">
          <view class="block__head">
            <text class="block__title">热门搜索</text>
          </view>
          <view class="hot">
            <view
              v-for="(item, index) in hotWords"
              :key="item"
              class="hot__item"
              @click="doSearch(item)"
            >
              <text class="hot__rank" :class="{ 'hot__rank--top': index < 3 }">
                {{ index + 1 }}
              </text>
              <text class="hot__text">{{ item }}</text>
            </view>
          </view>
        </view>
      </template>

      <!-- 搜索结果 -->
      <template v-else>
        <view class="block__head">
          <text class="block__title">「{{ keyword }}」的结果</text>
          <text class="block__more" @click="reset">重新搜索</text>
        </view>

        <view v-if="!results.length" class="empty">
          <text class="empty__text">没有找到相关课程</text>
        </view>

        <view v-else class="grid">
          <view v-for="item in results" :key="item.id" class="card" @click="goDetail(item.id)">
            <view class="card__cover" :style="{ background: item.cover }">
              <text class="card__emoji">{{ item.emoji }}</text>
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
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { contentApi } from '@/api/modules/content'
import type { CourseItem } from '@/api/types'

const keyword = ref('')
/** 进页面自动聚焦，省得用户再点一下 */
const autoFocus = ref(true)
const searched = ref(false)
const results = ref<CourseItem[]>([])

/** 历史搜索是设备本地数据，暂时留在页面里；热门搜索走后端 */
const history = ref<string[]>(['机器学习', 'Python', 'UI 设计', '前端入门'])
const hotWords = ref<string[]>([])

async function doSearch(word: string): Promise<void> {
  const text = word.trim()
  if (!text) return

  keyword.value = text
  searched.value = true

  // 记进历史：去重、最新的排最前、最多保留 8 条
  history.value = [text, ...history.value.filter((item) => item !== text)].slice(0, 8)

  try {
    const res = await contentApi.search(text)
    results.value = res.rows ?? []
  } catch {
    // 失败提示由 request 层统一 toast
    results.value = []
  }
}

function onConfirm(): void {
  if (!keyword.value.trim()) {
    uni.showToast({ title: '请输入搜索内容', icon: 'none' })
    return
  }
  void doSearch(keyword.value)
}

function removeHistory(index: number): void {
  history.value.splice(index, 1)
}

function clearHistory(): void {
  history.value = []
}

function reset(): void {
  keyword.value = ''
  searched.value = false
  results.value = []
}

function goDetail(id: number): void {
  uni.navigateTo({ url: `/pages-sub/content/detail?id=${id}` })
}

async function loadHotSearch(): Promise<void> {
  try {
    hotWords.value = await contentApi.hotSearch()
  } catch {
    hotWords.value = []
  }
}

onLoad(() => {
  void loadHotSearch()
})
</script>

<style lang="scss" scoped>
@import '../../styles/book-theme.scss';

.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 40rpx;
}

/* ---------- 搜索框 ---------- */

.bar {
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 28rpx;
  background-color: $card;
  border-radius: 999rpx;
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.bar__icon {
  position: relative;
  flex-shrink: 0;
  width: 32rpx;
  height: 32rpx;
  margin-right: 16rpx;
}

.bar__glass {
  width: 24rpx;
  height: 24rpx;
  border: 3rpx solid $text-3;
  border-radius: 50%;
}

.bar__handle {
  position: absolute;
  right: 0;
  bottom: 2rpx;
  width: 12rpx;
  height: 3rpx;
  background-color: $text-3;
  border-radius: 2rpx;
  transform: rotate(45deg);
}

.bar__input {
  flex: 1;
  height: 72rpx;
  font-size: 28rpx;
  color: $text;
}

.bar__ph {
  color: $text-3;
}

/* ---------- 区块 ---------- */

.block {
  margin-top: 40rpx;
}

.block__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 40rpx 0 20rpx;
}

.block__title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text;
}

.block__more {
  font-size: 24rpx;
  color: $text-3;
}

/* ---------- 历史搜索 ---------- */

.chips {
  display: flex;
  flex-wrap: wrap;
}

.chip {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx 12rpx 28rpx;
  margin: 0 16rpx 16rpx 0;
  background-color: $card;
  border-radius: 999rpx;
}

.chip__text {
  font-size: 26rpx;
  color: $text-2;
}

.chip__close {
  margin-left: 12rpx;
  font-size: 28rpx;
  line-height: 1;
  color: $text-3;
}

/* ---------- 热门搜索 ---------- */

.hot {
  padding: 4rpx 28rpx;
  background-color: $card;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.hot__item {
  display: flex;
  align-items: center;
  padding: 26rpx 0;
  border-bottom: 2rpx solid #f3f4f6;
}

.hot__item:last-child {
  border-bottom: none;
}

.hot__rank {
  width: 44rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: $text-3;
}

.hot__rank--top {
  color: $primary;
}

.hot__text {
  flex: 1;
  font-size: 28rpx;
  color: $text;
}

/* ---------- 结果为空 ---------- */

.empty {
  padding: 120rpx 0;
  text-align: center;
}

.empty__text {
  font-size: 26rpx;
  color: $text-3;
}

/* ---------- 双列结果卡片（与首页同一套） ---------- */

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
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.card__cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 260rpx;
}

.card__emoji {
  font-size: 88rpx;
  line-height: 1;
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
  color: $text-2;
}

.card__learners {
  margin-left: auto;
  font-size: 22rpx;
  color: $text-3;
}
</style>
