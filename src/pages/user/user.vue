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
        <view v-if="identity" class="card__tag">
          <text class="card__tag-text">{{ identity }}</text>
        </view>
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
        <!-- 个人简介 -->
        <view v-if="active === 0">
          <text class="panel__label">关于我</text>
          <text class="panel__text" :class="{ 'panel__text--empty': !intro }">
            {{ intro || '还没有填写个人简介' }}
          </text>
        </view>

        <!-- 观看历史：二级 [视频|书籍] + 三级 [未看完|已看完] -->
        <view v-else-if="active === 1">
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
        <view v-else-if="active === 2">
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
        <view v-else>
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
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'
import { MINE_TAB_KEY } from '@/utils/mine-tab'

interface HistoryItem {
  id: number
  /** 0 视频 / 1 书籍，对应 historyKinds 的下标 */
  kind: 0 | 1
  title: string
  done: boolean
  /** 未看完时显示；已看完留空（已看完不显示进度） */
  progress: string
}

interface CoverItem {
  id: number
  title: string
}

const userStore = useUserStore()

/* ---------- 用户信息 ---------- */

const isLogged = computed(() => userStore.isLogged)
const nickname = computed(() => userStore.userInfo?.nickName || '未命名')
const avatar = computed(() => userStore.userInfo?.avatar || '')
const avatarLetter = computed(() => nickname.value.slice(0, 1).toUpperCase())

/** 简介与身份标签：后端 sys_user 还没有对应字段，先把位置留出来 */
const intro = ref('')
const identity = ref('')

/* ---------- 页内 Tab ---------- */

const tabs = ['个人简介', '观看历史', '我的收藏', '我的书架']
const active = ref(0)

/* ---------- 观看历史 ---------- */

const historyKinds = ['视频', '书籍']
const historyStates = ['未看完', '已看完']
const historyKind = ref(0)
const historyState = ref(0)

/** 静态演示数据，接口就绪后整体换成接口返回 */
const historyData: HistoryItem[] = [
  {
    id: 1,
    kind: 0,
    title: 'Vue3 组合式 API 实战',
    done: false,
    progress: '上次观看至第 3 节 进度 45%'
  },
  {
    id: 2,
    kind: 0,
    title: '小程序分包与性能优化',
    done: false,
    progress: '上次观看至第 7 节 进度 80%'
  },
  { id: 3, kind: 0, title: 'TypeScript 类型基础入门', done: true, progress: '' },
  {
    id: 4,
    kind: 1,
    title: 'JavaScript 高级程序设计',
    done: false,
    progress: '上次看至 128 页 第 4 章'
  },
  { id: 5, kind: 1, title: '深入理解计算机系统', done: false, progress: '上次看至 56 页 第 2 章' },
  { id: 6, kind: 1, title: '代码整洁之道', done: true, progress: '' }
]

const historyList = computed(() =>
  historyData.filter(
    (item) => item.kind === historyKind.value && item.done === (historyState.value === 1)
  )
)

/* ---------- 我的收藏 / 我的书架 ---------- */

/** 静态演示数据，接口就绪后整体换成接口返回 */
const favoriteVideos: CoverItem[] = [
  { id: 1, title: 'Vue3 组合式 API 实战' },
  { id: 2, title: '小程序分包与性能优化' },
  { id: 3, title: 'TypeScript 类型基础入门' }
]

const shelfBooks: CoverItem[] = [
  { id: 1, title: 'JavaScript 高级程序设计' },
  { id: 2, title: '深入理解计算机系统' },
  { id: 3, title: '代码整洁之道' },
  { id: 4, title: '你不知道的 JavaScript' }
]

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

/* ---------- 从「观看历史」等旧路由跳进来时定位到对应 Tab ---------- */

onShow(() => {
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
  color: $ink;
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
  color: $ink;
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

  /* 比登录页的品牌标记更大、圆角更大，跟头像(圆形)、按钮(6rpx)区分开 */
  &__mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 136rpx;
    height: 136rpx;
    background-color: $ink;
    border-radius: 30rpx;
  }

  &__glyph {
    font-size: 64rpx;
    font-weight: 600;
    color: $paper;
  }

  &__title {
    margin-top: 52rpx;
    font-size: 44rpx;
    font-weight: 600;
    letter-spacing: 2rpx;
    color: $ink;
  }

  &__desc {
    margin-top: 20rpx;
    font-size: 26rpx;
    line-height: 1.8;
    letter-spacing: 1rpx;
    color: $warm-gray;
  }
}

/* ---------- 头像 + 信息卡 ---------- */

.hero {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding-top: 40rpx;
}

.hero__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 280rpx;
  height: 280rpx;
  overflow: hidden;
  background-color: $ink;
  border: 6rpx solid rgba(255, 252, 246, 0.9);
  border-radius: 50%;
}

.hero__img {
  width: 100%;
  height: 100%;
}

.hero__letter {
  font-size: 96rpx;
  font-weight: 600;
  color: $paper;
}

.card {
  position: relative;
  z-index: 1;
  padding: 180rpx 40rpx 48rpx;
  margin-top: -140rpx;
  text-align: center;
  background-color: rgba(255, 252, 246, 0.94);
  border: 2rpx solid rgba(24, 58, 55, 0.08);
  border-radius: 28rpx;
}

.card__name {
  display: block;
  font-size: 48rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  color: $ink;
}

.card__tag {
  display: inline-block;
  padding: 10rpx 32rpx;
  margin-top: 24rpx;
  background-color: #f1efea;
  border-radius: 999rpx;
}

.card__tag-text {
  font-size: 26rpx;
  color: $ink;
}

/* ---------- 页内 Tab ---------- */

.tabs {
  display: flex;
  align-items: center;
  margin-top: 44rpx;
}

.tabs__item {
  padding-bottom: 12rpx;
  margin-right: 44rpx;
  border-bottom: 6rpx solid transparent;
}

.tabs__item--on {
  border-bottom-color: $coral;
}

.tabs__text {
  font-size: 28rpx;
  color: $warm-gray;
}

.tabs__item--on .tabs__text {
  font-weight: 600;
  color: $ink;
}

/* ---------- 面板 ---------- */

.panel {
  margin-top: 40rpx;
}

.panel__label {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $ink;
}

.panel__text {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  line-height: 1.9;
  color: $warm-gray;
}

.panel__text--empty {
  color: rgba(138, 129, 124, 0.7);
}

.panel__empty {
  padding: 80rpx 0;
  text-align: center;
}

.panel__empty-text {
  font-size: 26rpx;
  color: $warm-gray;
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
  color: $warm-gray;
  background-color: rgba(255, 252, 246, 0.8);
  border: 2rpx solid rgba(24, 58, 55, 0.1);
  border-radius: 999rpx;
}

.seg__item--on {
  color: #fffcf6;
  background-color: $ink;
  border-color: $ink;
}

/* ---------- 列表条目 ---------- */

.items {
  margin-top: 28rpx;
}

.item {
  display: flex;
  padding: 20rpx;
  margin-bottom: 20rpx;
  background-color: rgba(255, 252, 246, 0.9);
  border: 2rpx solid rgba(24, 58, 55, 0.08);
  border-radius: 16rpx;
}

.item__cover {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 110rpx;
  background-color: rgba(24, 58, 55, 0.05);
  border-radius: 10rpx;
}

.item__badge {
  font-size: 24rpx;
  color: $warm-gray;
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
  color: $ink;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.item__sub {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: $warm-gray;
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
  background-color: rgba(24, 58, 55, 0.05);
  border: 2rpx solid rgba(24, 58, 55, 0.08);
  border-radius: 12rpx;
}

.grid__badge {
  font-size: 40rpx;
  color: rgba(24, 58, 55, 0.28);
}

.grid__title {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.5;
  color: $ink;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* ---------- 按钮 ---------- */

.btn {
  height: 96rpx;
  line-height: 96rpx;
  font-size: 30rpx;
  letter-spacing: 4rpx;
  border-radius: 6rpx;

  &::after {
    border: none;
  }

  &--primary {
    width: 440rpx;
    margin-top: 76rpx;
    color: $paper;
    background-color: $ink;
  }
}
</style>
