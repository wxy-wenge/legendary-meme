<template>
  <view class="paper-page">
    <!-- 背景装饰层：纯装饰，都在内容区之外 -->
    <view class="deco">
      <view class="deco__glow"></view>
      <view class="deco__rule"></view>
      <view class="deco__ring deco__ring--lg"></view>
      <view class="deco__plant">
        <view class="deco__plant-stem"></view>
        <view class="deco__leaf deco__leaf--a"></view>
        <view class="deco__leaf deco__leaf--b"></view>
      </view>
      <view class="deco__note"></view>
    </view>

    <!-- 自定义导航栏：tab 页要放 ⚙ 按钮，只能用自定义导航栏 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar__inner" :style="{ paddingRight: capsuleRight + 'px' }">
        <text class="navbar__title">我的</text>
        <view class="navbar__btn" @click="goSettings">
          <text class="navbar__gear">⚙</text>
        </view>
      </view>
    </view>

    <!-- 未登录：登录入口就放在这一页，不单独占 tab -->
    <view v-if="!isLogged" class="mine paper-content" :style="{ paddingTop: contentTop + 'px' }">
      <view class="guest">
        <view class="guest__mark">
          <text class="guest__glyph">学</text>
        </view>
        <text class="guest__title">还没有登录</text>
        <text class="guest__desc">登录后可以记录学习进度、收藏课程</text>
        <button class="btn btn--primary" @click="goLogin">登录 / 注册</button>
      </view>
    </view>

    <!-- 已登录：个人主页 -->
    <view v-else class="mine paper-content" :style="{ paddingTop: contentTop + 'px' }">
      <!-- 头像：一半压在信息卡上 -->
      <view class="hero">
        <view class="hero__avatar">
          <image v-if="avatar" class="hero__img" :src="avatar" mode="aspectFill" />
          <text v-else class="hero__letter">{{ avatarLetter }}</text>
        </view>
      </view>

      <view class="card">
        <text class="card__name">{{ nickname }}</text>
      </view>

      <!-- 页内 Tab -->
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
        <!-- 观看历史：二级 [视频|书籍] + 三级 [未看完|已看完] -->
        <view v-if="active === 0">
          <view class="seg">
            <text
              v-for="(item, index) in historyKinds"
              :key="item"
              class="seg__item"
              :class="{ 'seg__item--on': index === historyKind }"
              @click="historyKind = index"
            >
              {{ item }}
            </text>
          </view>

          <view class="seg seg--sub">
            <text
              v-for="(item, index) in historyStates"
              :key="item"
              class="seg__item"
              :class="{ 'seg__item--on': index === historyState }"
              @click="historyState = index"
            >
              {{ item }}
            </text>
          </view>

          <view v-if="!historyList.length" class="panel__empty">
            <text class="panel__empty-text">这里还没有记录</text>
          </view>

          <view v-else class="items">
            <view v-for="item in historyList" :key="item.id" class="item">
              <view class="item__cover">
                <text class="item__badge">{{ historyKinds[item.kind] }}</text>
              </view>
              <view class="item__body">
                <text class="item__title">{{ item.title }}</text>
                <text v-if="item.progress" class="item__sub">{{ item.progress }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 我的收藏：收藏的视频 -->
        <view v-else-if="active === 1">
          <view v-if="!favoriteVideos.length" class="panel__empty">
            <text class="panel__empty-text">还没有收藏任何视频</text>
          </view>

          <view v-else class="items">
            <view v-for="item in favoriteVideos" :key="item.id" class="item">
              <view class="item__cover">
                <text class="item__badge">视频</text>
              </view>
              <view class="item__body">
                <text class="item__title">{{ item.title }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 我的书架：两列网格 -->
        <view v-else-if="active === 2">
          <view v-if="!shelfBooks.length" class="panel__empty">
            <text class="panel__empty-text">书架还是空的</text>
          </view>

          <view v-else class="grid">
            <view v-for="item in shelfBooks" :key="item.id" class="grid__cell">
              <view class="grid__cover">
                <text class="grid__badge">书</text>
              </view>
              <text class="grid__title">{{ item.title }}</text>
            </view>
          </view>
        </view>

        <!-- 我的帖子 -->
        <view v-else>
          <view v-if="!myPosts.length" class="panel__empty">
            <text class="panel__empty-text">还没有发布过帖子</text>
          </view>

          <view v-else class="myposts">
            <view
              v-for="item in myPosts"
              :key="item.id"
              class="mypost"
              @click="goPostDetail(item.id)"
            >
              <text class="mypost__summary">{{ item.summary }}</text>

              <view class="mypost__foot">
                <text class="mypost__time">{{ item.createTime }}</text>
                <text class="mypost__stat">
                  ♡ {{ item.likeCount }} · 评论 {{ item.commentCount }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { communityApi } from '@/api/modules/community'
import { learningApi } from '@/api/modules/learning'
import { useUserStore } from '@/store/modules/user'
import { MINE_TAB_KEY } from '@/utils/mine-tab'
import type { CoverItem, LearnHistoryItem, PostItem } from '@/api/types'

const userStore = useUserStore()

/* ---------- 用户信息 ---------- */

const isLogged = computed(() => userStore.isLogged)
const nickname = computed(() => userStore.userInfo?.nickName || '未命名')
const avatar = computed(() => userStore.userInfo?.avatar || '')
const avatarLetter = computed(() => nickname.value.slice(0, 1).toUpperCase())

/* ---------- 页内 Tab ---------- */

const tabs = ['观看历史', '我的收藏', '我的书架', '我的帖子']
const active = ref(0)

/* ---------- 观看历史 ---------- */

const historyKinds = ['视频', '书籍']
const historyStates = ['未看完', '已看完']
const historyKind = ref(0)
const historyState = ref(0)

const historyData = ref<LearnHistoryItem[]>([])

const historyList = computed(() =>
  historyData.value.filter(
    (item) => item.kind === historyKind.value && item.done === (historyState.value === 1)
  )
)

async function loadHistory(): Promise<void> {
  try {
    const res = await learningApi.history()
    historyData.value = res.rows ?? []
  } catch {
    // 失败提示由 request 层统一 toast
    historyData.value = []
  }
}

/* ---------- 我的收藏 / 我的书架 ---------- */

const favoriteVideos = ref<CoverItem[]>([])
const shelfBooks = ref<CoverItem[]>([])

async function loadFavorites(): Promise<void> {
  try {
    const res = await learningApi.favorites()
    favoriteVideos.value = res.rows ?? []
  } catch {
    // 失败提示由 request 层统一 toast
    favoriteVideos.value = []
  }
}

async function loadShelf(): Promise<void> {
  try {
    const res = await learningApi.shelf()
    shelfBooks.value = res.rows ?? []
  } catch {
    // 失败提示由 request 层统一 toast
    shelfBooks.value = []
  }
}

/* ---------- 我的帖子 ---------- */

const myPosts = ref<PostItem[]>([])

async function loadMyPosts(): Promise<void> {
  try {
    const res = await communityApi.myPosts()
    myPosts.value = res.rows ?? []
  } catch {
    // 失败提示由 request 层统一 toast
    myPosts.value = []
  }
}

/* ---------- 自定义导航栏尺寸 ---------- */

const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = sysInfo.statusBarHeight ?? 0

/** 导航栏内容区高度，与微信胶囊保持同一水平线 */
const NAV_INNER_HEIGHT = 44

/** 内容从导航栏下面开始 */
const contentTop = statusBarHeight + NAV_INNER_HEIGHT

/** 微信端右上角有胶囊按钮，⚙ 必须排在它左边，否则会被盖住 */
let capsuleRight = 16
// #ifdef MP-WEIXIN
const menuRect = uni.getMenuButtonBoundingClientRect()
if (menuRect && menuRect.width) {
  capsuleRight = (sysInfo.windowWidth || 0) - menuRect.left + 8
}
// #endif

/* ---------- 跳转 ---------- */

function goSettings(): void {
  uni.navigateTo({ url: '/pages-sub/user/settings' })
}

function goLogin(): void {
  uni.navigateTo({ url: '/pages-sub/auth/login' })
}

function goPostDetail(id: number): void {
  uni.navigateTo({ url: `/pages-sub/community/post-detail?id=${id}` })
}

/* ---------- 从「观看历史」等旧路由跳进来时定位到对应 Tab ---------- */

onShow(() => {
  // 每次回到这一页都重新拉一次，保证数据是最新的
  void loadHistory()
  void loadFavorites()
  void loadShelf()
  void loadMyPosts()

  const raw = uni.getStorageSync(MINE_TAB_KEY)
  if (raw === '' || raw === undefined || raw === null) return

  const target = Number(raw)
  if (target >= 0 && target < tabs.length) active.value = target
  uni.removeStorageSync(MINE_TAB_KEY)
})
</script>

<style lang="scss" scoped>
@import '../../styles/book-theme.scss';

/* ---------- 自定义导航栏 ---------- */

.navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
  background-color: $bg;
}

.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding-left: 32rpx;
}

.navbar__title {
  font-size: 34rpx;
  font-weight: 600;
  color: $text;
}

.navbar__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
}

.navbar__gear {
  font-size: 40rpx;
  line-height: 1;
  color: $text;
}

/* ---------- 页面内容 ---------- */

.mine {
  padding-right: 44rpx;
  padding-bottom: 120rpx;
  padding-left: 44rpx;
}

/* ---------- 未登录 ---------- */

.guest {
  display: flex;
  flex-direction: column;
  align-items: center;

  /* 比登录页的品牌标记更大；圆角跟卡片一致，跟头像(圆形)、按钮(胶囊)区分开 */
  &__mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 136rpx;
    height: 136rpx;
    background-color: $primary;
    border-radius: 24rpx;
  }

  &__glyph {
    font-size: 64rpx;
    font-weight: 600;
    color: #ffffff;
  }

  &__title {
    margin-top: 52rpx;
    font-size: 44rpx;
    font-weight: 600;
    letter-spacing: 2rpx;
    color: $text;
  }

  &__desc {
    margin-top: 20rpx;
    font-size: 26rpx;
    line-height: 1.8;
    letter-spacing: 1rpx;
    color: $text-2;
  }
}

/* ---------- 头像 + 信息卡 ---------- */

.hero {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding-top: 20rpx;
}

.hero__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 160rpx;
  overflow: hidden;
  background-color: $primary;
  border: 6rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.hero__img {
  width: 100%;
  height: 100%;
}

.hero__letter {
  font-size: 56rpx;
  font-weight: 600;
  color: #ffffff;
}

.card {
  position: relative;
  z-index: 1;
  padding: 80rpx 40rpx 40rpx;
  margin-top: -60rpx;
  text-align: center;
  background-color: $card;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.card__name {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  color: $text;
}

/* ---------- 页内 Tab ---------- */

.tabs {
  display: flex;
  align-items: center;
  margin-top: 32rpx;
}

.tabs__item {
  flex: 1;
  padding-bottom: 12rpx;
  text-align: center;
  border-bottom: 6rpx solid transparent;
}

.tabs__item--on {
  border-bottom-color: $primary;
}

.tabs__text {
  font-size: 28rpx;
  color: $text-2;
}

.tabs__item--on .tabs__text {
  font-weight: 600;
  color: $text;
}

/* ---------- 面板 ---------- */

.panel {
  margin-top: 40rpx;
}

.panel__empty {
  padding: 80rpx 0;
  text-align: center;
}

.panel__empty-text {
  font-size: 26rpx;
  color: $text-2;
}

/* ---------- 我的帖子 ---------- */

.myposts {
  margin-top: 28rpx;
}

.mypost {
  padding: 20rpx 24rpx;
  margin-bottom: 16rpx;
  background-color: $card;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.mypost__summary {
  display: -webkit-box;
  overflow: hidden;
  font-size: 28rpx;
  line-height: 1.6;
  color: $text;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.mypost__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14rpx;
}

.mypost__time,
.mypost__stat {
  font-size: 22rpx;
  color: $text-3;
}

/* ---------- 二级 / 三级分段 ---------- */

.seg {
  display: flex;
  align-items: center;
}

.seg--sub {
  margin-top: 20rpx;
}

.seg__item {
  padding: 8rpx 24rpx;
  margin-right: 16rpx;
  font-size: 26rpx;
  color: $text-2;
  background-color: $card;
  border-radius: 999rpx;
}

.seg__item--on {
  color: #ffffff;
  background-color: $primary;
}

/* ---------- 列表条目 ---------- */

.items {
  margin-top: 28rpx;
}

.item {
  display: flex;
  padding: 20rpx;
  margin-bottom: 20rpx;
  background-color: $card;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.item__cover {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 110rpx;
  background-color: #eef2f7;
  border-radius: 10rpx;
}

.item__badge {
  font-size: 24rpx;
  color: $text-2;
}

.item__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: 20rpx;
  overflow: hidden;
}

.item__title {
  display: -webkit-box;
  overflow: hidden;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.5;
  color: $text;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.item__sub {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: $text-2;
}

/* ---------- 书架两列网格 ---------- */

.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 28rpx;
}

.grid__cell {
  width: 48%;
  margin-bottom: 28rpx;
}

.grid__cover {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 240rpx;
  background-color: #eef2f7;
  border-radius: 12rpx;
}

.grid__badge {
  font-size: 40rpx;
  color: $text-3;
}

.grid__title {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.5;
  color: $text;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* ---------- 按钮 ---------- */

.btn {
  height: 96rpx;
  line-height: 96rpx;
  font-size: 30rpx;
  letter-spacing: 4rpx;
  border-radius: 999rpx;

  &::after {
    border: none;
  }

  &--primary {
    width: 440rpx;
    margin-top: 76rpx;
    color: #ffffff;
    background-color: $primary;
  }
}
</style>
