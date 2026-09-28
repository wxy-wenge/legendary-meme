<template>
  <view class="page" :style="{ paddingBottom: 76 + safeBottom + 'px' }">
    <!-- 正文 -->
    <view class="card">
      <textarea
        v-model="content"
        class="editor"
        placeholder="分享你的学习心得…"
        placeholder-class="editor__ph"
        :maxlength="CONTENT_MAX"
        auto-height
      />
      <view class="counter">
        <text class="counter__text">{{ content.length }}/{{ CONTENT_MAX }}</text>
      </view>
    </view>

    <!-- 图片 -->
    <view class="card">
      <view class="card__title">添加图片</view>

      <view class="images">
        <view v-for="(item, index) in images" :key="index" class="images__item">
          <image class="images__img" :src="item" mode="aspectFill" />
          <view class="images__del" @click.stop="removeImage(index)">
            <text class="images__del-icon">×</text>
          </view>
        </view>

        <view v-if="images.length < IMAGE_MAX" class="images__add" @click="chooseImages">
          <text class="images__add-icon">＋</text>
        </view>
      </view>

      <text class="card__hint">最多 9 张。上传要等后端接口，现在选完只在本地预览。</text>
    </view>

    <!-- 话题 -->
    <view class="card">
      <view class="card__title">选择话题</view>
      <view class="topics">
        <text
          v-for="item in topics"
          :key="item"
          class="topics__item"
          :class="{ 'topics__item--on': topic === item }"
          @click="toggleTopic(item)"
        >
          #{{ item }}
        </text>
      </view>
    </view>

    <!-- 关联课程 -->
    <view class="card">
      <view class="row" @click="pickRelated">
        <text class="row__label">关联课程</text>

        <view class="row__right">
          <text class="row__value" :class="{ 'row__value--empty': !related }">
            {{ related ? related.title : '不关联' }}
          </text>
          <text v-if="related" class="row__clear" @click.stop="clearRelated">×</text>
          <text v-else class="row__arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 发布 -->
    <view class="footer" :style="{ paddingBottom: safeBottom + 'px' }">
      <view class="submit" :class="{ 'submit--off': !canSubmit }" @click="onSubmit">
        <text class="submit__text">{{ submitting ? '发布中…' : '发布' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { communityApi } from '@/api/modules/community'
import { contentApi } from '@/api/modules/content'
import type { CourseItem } from '@/api/types'

const CONTENT_MAX = 1000
const IMAGE_MAX = 9

/** 可选话题，和社区页顶部那排保持一致 */
const topics = ['今日学习打卡', '求大佬解答', '前端打卡', '算法刷题', '后端进阶']

const content = ref('')
const images = ref<string[]>([])
const topic = ref('')
const related = ref<CourseItem | null>(null)
const submitting = ref(false)

const sysInfo = uni.getSystemInfoSync()
const safeBottom = sysInfo.safeAreaInsets?.bottom ?? 0

const canSubmit = computed(() => content.value.trim().length > 0)

/* ---------- 话题 ---------- */

function toggleTopic(item: string): void {
  // 再点一次取消选中
  topic.value = topic.value === item ? '' : item
}

/* ---------- 图片 ---------- */

function chooseImages(): void {
  const rest = IMAGE_MAX - images.value.length
  if (rest <= 0) return

  uni.chooseImage({
    count: rest,
    sizeType: ['compressed'],
    success: (res) => {
      images.value = [...images.value, ...res.tempFilePaths].slice(0, IMAGE_MAX)
    }
  })
}

function removeImage(index: number): void {
  images.value.splice(index, 1)
}

/* ---------- 关联课程 ---------- */

async function pickRelated(): Promise<void> {
  let list: CourseItem[] = []
  try {
    const res = await contentApi.courses()
    list = res.rows ?? []
  } catch {
    // 失败提示由 request 层统一 toast
    return
  }
  if (!list.length) return

  // showActionSheet 最多 6 项
  const options = list.slice(0, 6)
  uni.showActionSheet({
    itemList: options.map((item) => item.title),
    success: (res) => {
      related.value = options[res.tapIndex] ?? null
    }
  })
}

function clearRelated(): void {
  related.value = null
}

/* ---------- 发布 ---------- */

async function onSubmit(): Promise<void> {
  const text = content.value.trim()
  if (!text) {
    uni.showToast({ title: '说点什么再发布', icon: 'none' })
    return
  }
  if (submitting.value) return
  submitting.value = true

  try {
    // 真实流程：先把 images 里的本地文件逐个上传（若依现成的是 POST /common/upload）换成 URL，
    // 再带着 URL 发帖。后端还没上传接口，这里先直接传本地路径。
    const created = await communityApi.createPost({
      content: text,
      topic: topic.value || undefined,
      images: images.value,
      relatedId: related.value?.id
    })

    uni.showToast({ title: '发布成功', icon: 'none' })
    setTimeout(() => {
      // 用 redirectTo 替换发帖页，免得用户返回后又回到空表单
      uni.redirectTo({ url: `/pages-sub/community/post-detail?id=${created.id}` })
    }, 700)
  } catch {
    // 失败提示由 request 层统一 toast
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/book-theme.scss';

.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 0;
  background-color: $bg;
}

/* ---------- 卡片 ---------- */

.card {
  padding: 24rpx;
  margin-bottom: 20rpx;
  background-color: $card;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $text;
}

.card__hint {
  display: block;
  margin-top: 16rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: $text-3;
}

/* ---------- 正文输入 ---------- */

.editor {
  width: 100%;
  min-height: 240rpx;
  font-size: 30rpx;
  line-height: 1.8;
  color: $text;
}

.editor__ph {
  color: $text-3;
}

.counter {
  display: flex;
  justify-content: flex-end;
  margin-top: 12rpx;
  padding-top: 16rpx;
  border-top: 2rpx solid #f3f4f6;
}

.counter__text {
  font-size: 22rpx;
  color: $text-3;
}

/* ---------- 图片 ---------- */

.images {
  display: flex;
  flex-wrap: wrap;
  margin-top: 20rpx;
}

.images__item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin: 0 14rpx 14rpx 0;
}

.images__img {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.images__del {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(31, 41, 55, 0.75);
  border-radius: 50%;
}

.images__del-icon {
  font-size: 28rpx;
  line-height: 1;
  color: #ffffff;
}

.images__add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200rpx;
  height: 200rpx;
  background-color: #eef2f7;
  border-radius: 12rpx;
}

.images__add-icon {
  font-size: 56rpx;
  line-height: 1;
  font-weight: 300;
  color: $text-3;
}

/* ---------- 话题 ---------- */

.topics {
  display: flex;
  flex-wrap: wrap;
  margin-top: 20rpx;
}

.topics__item {
  padding: 12rpx 24rpx;
  margin: 0 14rpx 14rpx 0;
  font-size: 25rpx;
  color: $text-2;
  background-color: #f3f4f6;
  border-radius: 999rpx;
}

.topics__item--on {
  color: #ffffff;
  background-color: $primary;
}

/* ---------- 关联课程 ---------- */

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.row__label {
  flex-shrink: 0;
  margin-right: 24rpx;
  font-size: 28rpx;
  color: $text;
}

.row__right {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
}

.row__value {
  overflow: hidden;
  font-size: 27rpx;
  color: $primary;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row__value--empty {
  color: $text-3;
}

.row__clear {
  flex-shrink: 0;
  margin-left: 16rpx;
  font-size: 30rpx;
  line-height: 1;
  color: $text-3;
}

.row__arrow {
  flex-shrink: 0;
  margin-left: 10rpx;
  font-size: 32rpx;
  line-height: 1;
  color: $text-3;
}

/* ---------- 底部发布 ---------- */

.footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  padding: 16rpx 24rpx;
  background-color: $card;
  box-shadow: 0 -8rpx 24rpx rgba(31, 41, 55, 0.06);
}

.submit {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background-color: $primary;
  border-radius: 999rpx;
}

.submit--off {
  opacity: 0.45;
}

.submit__text {
  font-size: 30rpx;
  letter-spacing: 4rpx;
  color: #ffffff;
}
</style>
