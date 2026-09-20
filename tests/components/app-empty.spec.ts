import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import AppEmpty from '@/components/app-empty/app-empty.vue'

describe('AppEmpty', () => {
  it('默认只渲染标题', () => {
    const wrapper = mount(AppEmpty)

    expect(wrapper.find('.app-empty__title').text()).toBe('暂无数据')
    expect(wrapper.find('.app-empty__desc').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('传入 description 时渲染描述', () => {
    const wrapper = mount(AppEmpty, { props: { description: '没有更多内容了' } })

    expect(wrapper.find('.app-empty__desc').text()).toBe('没有更多内容了')
  })

  it('点击重试按钮派发 retry 事件', async () => {
    const wrapper = mount(AppEmpty, { props: { showRetry: true, retryText: '再来一次' } })
    const button = wrapper.find('button')

    expect(button.text()).toBe('再来一次')

    await button.trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('渲染默认插槽内容', () => {
    const wrapper = mount(AppEmpty, {
      slots: { default: () => h('span', { class: 'extra' }, '补充内容') }
    })

    expect(wrapper.find('.extra').text()).toBe('补充内容')
  })
})
