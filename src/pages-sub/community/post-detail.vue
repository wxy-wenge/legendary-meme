<template>
  <view class="page" :style="{ paddingBottom: 72 + safeBottom + 'px' }">
    <view v-if="loading" class="tip">
      <text class="tip__text">加载中…</text>
    </view>

    <view v-else-if="failed" class="tip">
      <text class="tip__text">帖子不存在或已删除</text>
    </view>

    <template v-else>
      <!-- 主贴 -->
      <view class="post">
        <view class="post__head">
          <view class="avatar">
            <text class="avatar__letter">{{ post.author.nickName.slice(0, 1) }}</text>
          </view>
          <view class="post__user">
            <text class="post__name">{{ post.author.nickName }}</text>
            <text class="post__sub">{{ postSub }}</text>
          </view>
        </view>

        <text class="post__content">{{ post.content }}</text>

        <!-- 配图：后端有上传能力后 media 才会有内容 -->
        <view v-if="post.media.length" class="media">
          <image
            v-for="(item, index) in post.media"
            :key="index"
            class="media__item"
            :src="item.url"
            mode="aspectFill"
          />
        </view>

        <view class="post__stats">
          <text class="post__stat">♡ {{ post.likeCount }} 点赞</text>
          <text class="post__stat">{{ post.commentCount }} 评论</text>
        </view>
      </view>

      <!-- 评论区 -->
      <view class="comments">
        <view class="comments__head">
          <text class="comments__title">全部评论</text>
          <text class="comments__count">{{ post.commentCount }}</text>
        </view>

        <view v-if="!comments.length" class="empty">
          <text class="empty__text">还没有人评论，来说两句</text>
        </view>

        <view v-for="item in comments" :key="item.id" class="comment">
          <view class="avatar avatar--sm">
            <text class="avatar__letter">{{ item.author.nickName.slice(0, 1) }}</text>
          </view>

          <view class="comment__body">
            <text class="comment__name">{{ item.author.nickName }}</text>
            <text class="comment__text">{{ item.content }}</text>

            <view class="comment__foot">
              <text class="comment__time">{{ item.createTime }}</text>
              <text class="comment__like">♡ {{ item.likeCount }}</text>
            </view>

            <!-- 楼中楼，只有一层 -->
            <view v-if="item.replies && item.replies.length" class="replies">
              <view v-for="reply in item.replies" :key="reply.id" class="reply">
                <text class="reply__name">{{ reply.author.nickName }}：</text>
                <text class="reply__text">{{ reply.content }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 底部操作栏 -->
    <view class="actionbar" :style="{ paddingBottom: safeBottom + 'px' }">
      <input
        v-model="draft"
        class="actionbar__input"
        type="text"
        placeholder="说点什么…"
        placeholder-class="actionbar__ph"
        :maxlength="200"
        confirm-type="send"
        cursor-spacing="20"
        @confirm="onSend"
      />

      <!-- 有内容时把三个图标换成发送，避免挤在一起 -->
      <view v-if="draft.trim()" class="actionbar__send" @click="onSend">
        <text class="actionbar__send-text">发送</text>
      </view>

      <template v-else>
        <view class="actionbar__item" @click="onLike">
          <text class="actionbar__heart" :class="{ 'actionbar__heart--on': post.liked }">
            {{ post.liked ? '♥' : '♡' }}
          </text>
        </view>

        <view class="actionbar__item" @click="onFav">
          <view class="bm" :class="post.favorited ? 'bm--on' : 'bm--off'">
            <view class="bm__body"></view>
            <view class="bm__tip"></view>
          </view>
        </view>

        <view class="actionbar__item" @click="onShare">
          <view class="share">
            <view class="share__box"></view>
            <view class="share__arrow"></view>
            <view class="share__stem"></view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { communityApi } from '@/api/modules/community'
import type { PostComment, PostDetail } from '@/api/types'

/** 用空对象兜底，模板里就不用到处判空 */
const post = ref<PostDetail>({
  id: 0,
  author: { userId: 0, nickName: '', avatar: '' },
  content: '',
  topic: '',
  media: [],
  createTime: '',
  likeCount: 0,
  commentCount: 0,
  liked: false,
  favorited: false
})

const comments = ref<PostComment[]>([])
const loading = ref(true)
const failed = ref(false)
const draft = ref('')

let postId = 1

const postSub = computed(() => {
  const parts = [post.value.createTime]
  if (post.value.topic) parts.push(`#${post.value.topic}`)
  return parts.join(' · ')
})

const sysInfo = uni.getSystemInfoSync()
const safeBottom = sysInfo.safeAreaInsets?.bottom ?? 0

/* ---------- 加载 ---------- */

async function load(): Promise<void> {
  loading.value = true
  failed.value = false
  try {
    const [detail, list] = await Promise.all([
      communityApi.postDetail(postId),
      communityApi.postComments(postId)
    ])
    post.value = detail
    comments.value = list.rows ?? []
  } catch {
    // 失败提示由 request 层统一 toast
    failed.value = true
  } finally {
    loading.value = false
  }
}

onLoad((options) => {
  const id = Number((options as Record<string, string> | undefined)?.id ?? 0)
  if (id > 0) postId = id
  void load()
})

/* ---------- 交互 ---------- */

/** 点赞：先改界面再发请求，失败回滚 —— 点起来才不卡 */
async function onLike(): Promise<void> {
  const next = !post.value.liked
  post.value.liked = next
  post.value.likeCount += next ? 1 : -1

  try {
    await communityApi.like(postId, next)
  } catch {
    post.value.liked = !next
    post.value.likeCount += next ? -1 : 1
  }
}

async function onFav(): Promise<void> {
  const next = !post.value.favorited
  post.value.favorited = next

  try {
    await communityApi.favorite(postId, next)
    uni.showToast({ title: next ? '已收藏' : '已取消收藏', icon: 'none' })
  } catch {
    post.value.favorited = !next
  }
}

async function onSend(): Promise<void> {
  const content = draft.value.trim()
  if (!content) {
    uni.showToast({ title: '先说点什么', icon: 'none' })
    return
  }

  try {
    const created = await communityApi.addComment(postId, content)
    comments.value = [created, ...comments.value]
    post.value.commentCount += 1
    draft.value = ''
    uni.showToast({ title: '已发布', icon: 'none' })
  } catch {
    // 失败提示由 request 层统一 toast
  }
}

function onShare(): void {
  uni.showToast({ title: '小程序请用右上角菜单分享', icon: 'none' })
}
</script>

<style lang="scss" scoped>
@import '../../styles/book-theme.scss';

.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 0;
  background-color: $bg;
}

/* ---------- 头像 ---------- */

.avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  background-color: $primary;
  border-radius: 50%;
}

.avatar--sm {
  width: 64rpx;
  height: 64rpx;
}

.avatar__letter {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}

.avatar--sm .avatar__letter {
  font-size: 26rpx;
}

/* ---------- 主贴 ---------- */

.post {
  padding: 28rpx;
  background-color: $card;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.post__head {
  display: flex;
  align-items: center;
}

.post__user {
  flex: 1;
  margin-left: 20rpx;
  overflow: hidden;
}

.post__name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $text;
}

.post__sub {
  display: block;
  margin-top: 6rpx;
  font-size: 23rpx;
  color: $text-3;
}

.post__content {
  display: block;
  margin-top: 26rpx;
  font-size: 30rpx;
  line-height: 1.9;
  color: $text;
  white-space: pre-line;
}

.media {
  display: flex;
  flex-wrap: wrap;
  margin-top: 20rpx;
}

.media__item {
  width: 210rpx;
  height: 210rpx;
  margin: 0 10rpx 10rpx 0;
  background-color: #eef2f7;
  border-radius: 12rpx;
}

.post__stats {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding-top: 22rpx;
  border-top: 2rpx solid #f3f4f6;
}

.post__stat {
  margin-right: 32rpx;
  font-size: 24rpx;
  color: $text-3;
}

/* ---------- 评论区 ---------- */

.comments {
  padding: 28rpx;
  margin-top: 20rpx;
  background-color: $card;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.comments__head {
  display: flex;
  align-items: baseline;
  padding-bottom: 22rpx;
  border-bottom: 2rpx solid #f3f4f6;
}

.comments__title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text;
}

.comments__count {
  margin-left: 10rpx;
  font-size: 24rpx;
  color: $text-3;
}

.comment {
  display: flex;
  padding-top: 28rpx;
}

.comment__body {
  flex: 1;
  margin-left: 18rpx;
  overflow: hidden;
}

.comment__name {
  display: block;
  font-size: 27rpx;
  font-weight: 600;
  color: $text-2;
}

.comment__text {
  display: block;
  margin-top: 10rpx;
  font-size: 28rpx;
  line-height: 1.7;
  color: $text;
}

.comment__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.comment__time {
  font-size: 22rpx;
  color: $text-3;
}

.comment__like {
  font-size: 22rpx;
  color: $text-3;
}

/* 楼中楼 */
.replies {
  padding: 16rpx 20rpx;
  margin-top: 16rpx;
  background-color: #f7f9fc;
  border-radius: 12rpx;
}

.reply {
  padding: 6rpx 0;
}

.reply__name {
  font-size: 26rpx;
  font-weight: 600;
  color: $primary;
}

.reply__text {
  font-size: 26rpx;
  line-height: 1.7;
  color: $text-2;
}

/* ---------- 空 / 状态提示 ---------- */

.empty {
  padding: 80rpx 0;
  text-align: center;
}

.empty__text {
  font-size: 26rpx;
  color: $text-3;
}

.tip {
  padding: 200rpx 0;
  text-align: center;
}

.tip__text {
  font-size: 26rpx;
  color: $text-3;
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
  padding: 16rpx 24rpx;
  background-color: $card;
  box-shadow: 0 -8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.actionbar__input {
  flex: 1;
  height: 72rpx;
  padding: 0 28rpx;
  font-size: 27rpx;
  color: $text;
  background-color: #f3f4f6;
  border-radius: 999rpx;
}

.actionbar__ph {
  color: $text-3;
}

.actionbar__send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  height: 72rpx;
  margin-left: 16rpx;
  background-color: $primary;
  border-radius: 999rpx;
}

.actionbar__send-text {
  font-size: 27rpx;
  color: #ffffff;
}

.actionbar__item {
  display: flex;
  align-items: center;
  padding: 0 16rpx;
}

.actionbar__heart {
  font-size: 40rpx;
  line-height: 1;
  color: $text-3;
}

.actionbar__heart--on {
  color: #ef4444;
}

/* 书签图标（收藏） */
.bm {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bm__body {
  width: 22rpx;
  height: 20rpx;
  border-radius: 4rpx 4rpx 0 0;
}

.bm__tip {
  width: 0;
  height: 0;
  border-right: 11rpx solid transparent;
  border-left: 11rpx solid transparent;
  border-top: 9rpx solid;
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

/* 分享图标：方框 + 向上箭头 */
.share {
  position: relative;
  width: 32rpx;
  height: 32rpx;
}

.share__box {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 32rpx;
  height: 21rpx;
  border: 3rpx solid $text-3;
  border-radius: 6rpx;
}

.share__arrow {
  position: absolute;
  top: 0;
  left: 50%;
  width: 0;
  height: 0;
  margin-left: -7rpx;
  border-right: 7rpx solid transparent;
  border-bottom: 8rpx solid $text-3;
  border-left: 7rpx solid transparent;
}

.share__stem {
  position: absolute;
  top: 6rpx;
  left: 50%;
  width: 3rpx;
  height: 11rpx;
  margin-left: -1.5rpx;
  background-color: $text-3;
}
</style>
