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
            :key="item.label"
            class="community__topic"
            :class="{ 'community__topic--on': index === activeTopic }"
            @click="onTopic(index)"
          >
            {{ item.label }}
          </text>
        </view>
      </scroll-view>

      <view class="sec">
        <text class="sec__title">最新帖子</text>
        <text class="sec__more" @click="goCreate">发帖 ›</text>
      </view>

      <view v-if="loading" class="tip">
        <text class="tip__text">加载中…</text>
      </view>

      <view v-else-if="!posts.length" class="tip">
        <text class="tip__text">这个话题下还没有帖子</text>
      </view>

      <view v-else class="community__list">
        <view v-for="item in posts" :key="item.id" class="post" @click="goPostDetail(item.id)">
          <view class="post__head">
            <view class="avatar">
              <text class="avatar__letter">{{ item.author.nickName.slice(0, 1) }}</text>
            </view>

            <view class="post__who">
              <text class="post__name">{{ item.author.nickName }}</text>
              <text class="post__time">{{ item.createTime }}</text>
            </view>

            <text v-if="item.topic" class="post__topic">#{{ item.topic }}</text>
          </view>

          <text class="post__summary">{{ item.summary }}</text>

          <!-- 配图：后端有上传能力后 images 才会有内容 -->
          <view v-if="item.images.length" class="post__images">
            <image
              v-for="(img, index) in item.images"
              :key="index"
              class="post__image"
              :src="img"
              mode="aspectFill"
            />
          </view>

          <view class="post__stats">
            <text class="post__stat">♡ {{ item.likeCount }}</text>
            <text class="post__stat">评论 {{ item.commentCount }}</text>
          </view>
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
import { onLoad } from '@dcloudio/uni-app'
import { communityApi } from '@/api/modules/community'
import type { PostItem } from '@/api/types'

interface Topic {
  /** 显示文案，带 # */
  label: string
  /** 传给接口的值，不带 #；空串表示不筛 */
  value: string
}

const topics: Topic[] = [
  { label: '全部', value: '' },
  { label: '#今日学习打卡', value: '今日学习打卡' },
  { label: '#求大佬解答', value: '求大佬解答' },
  { label: '#前端打卡', value: '前端打卡' },
  { label: '#算法刷题', value: '算法刷题' }
]

const activeTopic = ref(0)
const posts = ref<PostItem[]>([])
const loading = ref(true)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await communityApi.postList(topics[activeTopic.value]?.value)
    posts.value = res.rows ?? []
  } catch {
    // 失败提示由 request 层统一 toast
    posts.value = []
  } finally {
    loading.value = false
  }
}

function onTopic(index: number): void {
  if (index === activeTopic.value) return
  activeTopic.value = index
  void load()
}

function goTopic(): void {
  uni.navigateTo({ url: '/pages-sub/community/topic' })
}

function goCreate(): void {
  uni.navigateTo({ url: '/pages-sub/community/post-create' })
}

function goPostDetail(id: number): void {
  uni.navigateTo({ url: `/pages-sub/community/post-detail?id=${id}` })
}

onLoad(() => {
  void load()
})
</script>

<style lang="scss" scoped>
@import '../../styles/skeleton.scss';

.community {
  padding: 24rpx 32rpx 160rpx;
}

/* ---------- 话题标签 ---------- */

.community__topics {
  white-space: nowrap;
}

.community__topics-inner {
  display: inline-flex;
  align-items: center;
}

.community__topic {
  padding: 12rpx 28rpx;
  margin-right: 16rpx;
  font-size: 26rpx;
  color: $text-2;
  background-color: $card;
  border-radius: 999rpx;
}

.community__topic--on {
  color: #ffffff;
  background-color: $primary;
}

/* ---------- 帖子卡片 ---------- */

.post {
  padding: 24rpx;
  margin-bottom: 20rpx;
  background-color: $card;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.post__head {
  display: flex;
  align-items: center;
}

.avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  background-color: $primary;
  border-radius: 50%;
}

.avatar__letter {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}

.post__who {
  flex: 1;
  margin-left: 16rpx;
  overflow: hidden;
}

.post__name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $text;
}

.post__time {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: $text-3;
}

.post__topic {
  flex-shrink: 0;
  padding: 6rpx 16rpx;
  margin-left: 12rpx;
  font-size: 22rpx;
  color: $primary;
  background-color: #eef2f7;
  border-radius: 999rpx;
}

.post__summary {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 18rpx;
  font-size: 28rpx;
  line-height: 1.7;
  color: $text-2;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.post__images {
  display: flex;
  margin-top: 16rpx;
}

.post__image {
  width: 200rpx;
  height: 200rpx;
  margin-right: 12rpx;
  background-color: #eef2f7;
  border-radius: 12rpx;
}

.post__stats {
  display: flex;
  align-items: center;
  margin-top: 18rpx;
}

.post__stat {
  margin-right: 32rpx;
  font-size: 23rpx;
  color: $text-3;
}

/* ---------- 发帖悬浮按钮 ---------- */

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
  background-color: $primary;
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.24);
}

.community__fab-icon {
  font-size: 52rpx;
  line-height: 1;
  color: #ffffff;
}

/* ---------- 状态提示 ---------- */

.tip {
  padding: 100rpx 0;
  text-align: center;
}

.tip__text {
  font-size: 26rpx;
  color: $text-3;
}
</style>
