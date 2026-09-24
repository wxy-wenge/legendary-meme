/**
 * 「我的」页内 Tab 的定位。
 *
 * uni.switchTab 的 url **不支持 query**（微信端的限制），
 * 所以没法用 `/pages/user/user?tab=1` 跳过去。
 * 这里用本地存储做一次性传参：跳转前写入目标下标，user.vue 的 onShow 读走后立刻清掉。
 */

/** 一次性传参用的存储 key */
export const MINE_TAB_KEY = 'mine_tab_target'

/** 页内 Tab 下标，顺序必须和 pages/user/user.vue 里的 tabs 一致 */
export const MINE_TAB = {
  intro: 0,
  history: 1,
  favorite: 2,
  shelf: 3
} as const

/** 跳到「我的」并自动切到指定的页内 Tab */
export function goMineTab(index: number): void {
  uni.setStorageSync(MINE_TAB_KEY, index)
  uni.switchTab({ url: '/pages/user/user' })
}
