<template>
  <view class="app-empty">
    <text class="app-empty__title">{{ title }}</text>
    <text v-if="description" class="app-empty__desc">{{ description }}</text>
    <button v-if="showRetry" class="app-empty__action" size="mini" @click="emit('retry')">
      {{ retryText }}
    </button>
    <slot />
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    showRetry?: boolean
    retryText?: string
  }>(),
  {
    title: '暂无数据',
    description: '',
    showRetry: false,
    retryText: '重新加载'
  }
)

const emit = defineEmits<{ retry: [] }>()
</script>

<style lang="scss" scoped>
.app-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx $uni-spacing-row-base;

  &__title {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
  }

  &__desc {
    margin-top: $uni-spacing-col-base;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-disable;
  }

  &__action {
    margin-top: $uni-spacing-col-lg;
  }
}
</style>
