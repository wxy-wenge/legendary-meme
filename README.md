# uni-app-template

**多端小程序的前端工程。** 一套代码同时编译到微信小程序、支付宝小程序、抖音小程序（H5 只用来在电脑上快速看效果）。

> ⚠️ **这个仓库只有前端。** 后端是另一个仓库/服务，通过 HTTP 接口对接。
> 接口约定见下面「[与后端对接](#与后端对接)」。

## 里面已经有什么

- 目录分好了层（页面 / 组件 / 接口 / 状态 / 工具 / 配置），几个人同时写不容易撞车
- 网络请求封装好了：自动带 token、自动提示错误、自动管理加载中
- 状态管理（Pinia）配好了，并且能存到本地（关掉小程序再打开还在）
- UI 组件库 [wot-design-uni](https://wot-design-uni.netlify.app/) 接好了，写 `<wd-button>` 就能直接用
- 主包 / 分包分开了，微信那 2MB 的限制不会突然卡住你
- 单元测试、代码格式检查、提交信息检查都配好了
- 推到 GitHub 会自动跑一遍检查（CI）
- **看 [CONTRIBUTING.md](./CONTRIBUTING.md) 知道每天怎么干活**

## 支持平台

| 平台               | 开发（要一直开着）       | 打包                       | 产物在哪            |
| ------------------ | ------------------------ | -------------------------- | ------------------- |
| 微信小程序         | `npm run dev:mp-weixin`  | `npm run build:mp-weixin`  | `dist/*/mp-weixin`  |
| 支付宝小程序       | `npm run dev:mp-alipay`  | `npm run build:mp-alipay`  | `dist/*/mp-alipay`  |
| 抖音小程序         | `npm run dev:mp-toutiao` | `npm run build:mp-toutiao` | `dist/*/mp-toutiao` |
| H5（只在电脑上看） | `npm run dev:h5`         | `npm run build:h5`         | `dist/*/h5`         |

三端一起打包：`npm run build:mp-all`

## 技术栈版本

| 依赖             | 版本                       | 说明                                         |
| ---------------- | -------------------------- | -------------------------------------------- |
| `@dcloudio/*`    | `3.0.0-5020620260917001`   | uni-app 的 vue3 版                           |
| `vite`           | `5.2.8`                    | ⚠️ **被 uni-app 锁死了，不要升级**           |
| `vue`            | `^3.4.21`                  |                                              |
| `pinia`          | `^3.0.4`                   | 状态管理，配套 `pinia-plugin-persistedstate` |
| `wot-design-uni` | `^1.14.0`                  | UI 组件库                                    |
| `typescript`     | `~5.9.3`                   |                                              |
| `vitest`         | `^2.1.9`                   | 单元测试，必须留在 2.x                       |
| Node             | `>=20.19.0`（见 `.nvmrc`） | 团队统一用 Node 24                           |

> **为什么 vite 不能升级**：uni-app 明确要求 `vite@5.2.8` 这个版本，
> 而最新的插件和测试工具都要求 vite 6/7。所以整条工具链只能停在 vite 5。
> 手贱升级了会直接装不上。

## 目录结构

```
.
├─ .github/                # PR / Issue 模板、CI 配置
│  └─ workflows/ci.yml
├─ src
│  ├─ api/                 # 接口层
│  │  ├─ modules/          # 按业务模块拆（user.ts / course.ts…）一人一个文件
│  │  ├─ types.ts          # 接口的参数和返回类型
│  │  └─ index.ts
│  ├─ components/          # 自己写的组件，目录名 = 标签名
│  │  └─ app-empty/app-empty.vue
│  ├─ composables/         # 可以复用的逻辑（useRequest / useTheme）
│  ├─ config/              # 环境变量的唯一出口
│  ├─ pages/               # 主包页面（只有 tabBar 那两三个）
│  ├─ pages-sub/           # 分包页面，业务页面都放这
│  │  └─ blank/blank.vue   # 空白模板，写新页面时复制它
│  ├─ static/              # 静态资源（别塞大图）
│  ├─ store/               # Pinia 状态
│  │  ├─ modules/          # app / user
│  │  └─ persist.ts        # 用 uni 的存储，不是浏览器 localStorage
│  ├─ types/               # 通用类型
│  ├─ utils/               # request / storage / auth / format
│  ├─ App.vue              # 全局样式
│  ├─ main.ts              # 入口
│  ├─ manifest.json        # 各端 appid 和平台配置
│  ├─ pages.json           # 路由 / tabBar / 分包 / 组件库配置
│  └─ uni.scss             # 主题变量（会被自动用到每个页面的样式里）
├─ tests
│  ├─ setup.ts             # 伪造一套 uni 的 API，好让测试能跑
│  ├─ unit/
│  └─ components/
├─ CONTRIBUTING.md         # 每天怎么干活，新人必读
└─ 各种配置：vite / vitest / tsconfig / eslint / prettier / commitlint
```

## 快速开始

```bash
npm install
npm run dev:mp-weixin       # 这个命令要一直开着
```

然后用**微信开发者工具**导入 `dist/dev/mp-weixin`。

> ⚠️ 导入的是 `dist/dev/mp-weixin`，**不是项目根目录**。
> 根目录里没有 `app.json`，导错了会报「在项目根目录未找到 app.json」。

### 小程序 appid

**不用注册小程序，用微信的测试号就行**（一分钟）：

1. 打开 https://mp.weixin.qq.com/wxamp/sandbox?doc=1 ，微信扫码，立刻拿到一个测试号
2. 把 appid 填进 `src/manifest.json` 的 `mp-weixin.appid`
3. 填完**马上**执行这条：

   ```bash
   git update-index --skip-worktree src/manifest.json
   ```

**为什么第 3 步必须做**：测试号绑个人微信，**每个人的 appid 都不一样**，
不忽略的话你一提交就把别人的覆盖了。

**只写页面、不碰微信登录的话，这一步可以跳过** —— 留空就是游客模式，模拟器里够用。

支付宝 / 抖音端的配置分别在 `mp-alipay`、`mp-toutiao` 节点下。

## 与后端对接

前端和后端只有两个接触点。

### 1. 接口地址

写在 `.env` 里，代码里不直接写：

| 文件               | 变量                | 说明               |
| ------------------ | ------------------- | ------------------ |
| `.env.development` | `VITE_PROXY_TARGET` | 本地开发的代理目标 |
| `.env.production`  | `VITE_API_BASE_URL` | 正式环境的接口地址 |

### 2. 返回格式（后端必须照这个来）

`src/utils/request.ts` 已经约定了格式，**后端不按这个返回，前端就得改代码**：

```json
{ "code": 0, "message": "成功", "data": {} }
```

- 成功时 `code` 是 `0`（想改可以在 `.env` 的 `VITE_API_SUCCESS_CODE` 改）
- 失败时 `code` 非 0，`message` 会**直接弹给用户看**，所以要写成人话
- 登录失效用 `401`，前端看到会自动清掉本地 token 并提示重新登录

### 3. 接口写在哪

统一写在 `src/api/modules/<模块>.ts`，**页面里不要拼 URL**。
新增时顺手在 `src/api/types.ts` 补上类型。

**一人一个文件，互不冲突。**

## 常用命令

```bash
# 开发（要一直开着）
npm run dev:mp-weixin / dev:mp-alipay / dev:mp-toutiao / dev:h5

# 打包
npm run build:mp-weixin / build:mp-alipay / build:mp-toutiao / build:h5
npm run build:mp-all      # 三端一起打

# 检查
npm run lint              # 检查并自动修格式
npm run lint:check        # 只检查不修（CI 用的是这个）
npm run type-check        # 检查类型有没有写错
npm run test              # 跑单元测试
```

## 环境变量

`src/config/index.ts` 是唯一读环境变量的地方，代码里都从这里拿。

| 文件               | 提交？ | 用途                                       |
| ------------------ | ------ | ------------------------------------------ |
| `.env`             | 是     | 所有环境共用（标题、超时、存储前缀）       |
| `.env.development` | 是     | 开发环境                                   |
| `.env.production`  | 是     | 正式环境                                   |
| `.env.local`       | **否** | 只影响你自己，从 `.env.local.example` 复制 |

**想让接口指向自己电脑上的后端**：复制 `.env.local.example` 为 `.env.local`，
改里面的 `VITE_PROXY_TARGET`。这个文件不会提交，不会影响别人。

加新变量时记得去 `src/env.d.ts` 补一行类型声明。

## 请求封装

`src/utils/request.ts` 提供了 `request / get / post / put / del`，它会帮你：

- 自动拼上接口地址（写完整网址的话就原样用）
- 自动带上 `Authorization: Bearer <token>`，登录接口传 `{ auth: false }` 就不带
- 自动判断 `code`：成功直接给你 `data`，登录失效自动清 token
- `loading: true` 时自动显示加载中，多个请求同时发也不会互相干扰
- 失败自动弹提示（不想弹就传 `toast: false`）
- 出错统一抛 `RequestError`，里面带着 `code` 和原始数据

页面里推荐配合 `useRequest` 用，省掉手写 try-catch：

```ts
const { data, loading, error, run } = useRequest(courseApi.getList)
await run({ page: 1, pageSize: 10 })
```

## 状态管理

用 Pinia 的 setup 写法。持久化用的是 `uni.getStorageSync`（浏览器那套 `localStorage`
在小程序里根本不存在），适配代码在 `src/store/persist.ts`。

```ts
export const useUserStore = defineStore(
  'user',
  () => {
    /* ... */
  },
  {
    persist: { key: 'user', storage: uniStorage, pick: ['token', 'userInfo'] }
  }
)
```

## UI 组件库

[wot-design-uni](https://wot-design-uni.netlify.app/) 已经配好，**模板里直接写就行，不用 import**：

```vue
<wd-button type="primary" @click="onClick">提交</wd-button>
<wd-cell title="当前平台" :value="platform" />
```

- 只写了的组件才会被打包，没用到的不占体积
- 想改主题色：组件用的是 CSS 变量（`var(--wot-color-theme, ...)`），
  在 `App.vue` 的全局样式里覆盖变量就行，不用改 SCSS
- 有哪些组件：看官方文档，或者直接翻 `node_modules/wot-design-uni/components/`

## 页面放哪：主包 vs 分包

**主包只放 tabBar 那几个页面，其他业务页面全部放分包。**

微信主包上限 **2MB**，超了传不上去。而这个限制往往在你功能堆到一半的时候突然爆发，
所以从第一天就养成习惯：

```jsonc
// src/pages.json
"subPackages": [
  { "root": "pages-sub", "pages": [{ "path": "blank/blank" }] }
]
```

对应文件是 `src/pages-sub/blank/blank.vue`，跳转路径 `/pages-sub/blank/blank`。
**写新页面时复制它改就行。**

规矩就一条：分包能用主包的东西，**主包不能用分包的东西**。
`utils` / `store` / `api` 都在 `src/` 下（等于在主干里），所以随便用。

## 代码格式和提交

提交的时候 husky 会自动把关：

- 提交前：对改动的文件跑一遍 ESLint 和 Prettier，自动修格式
- 提交时：检查你的提交信息格式对不对，不对直接拒绝

允许的类型：`feat / fix / docs / style / refactor / perf / test / build / ci / chore / revert`

```
feat: 新增课程列表页
fix: 修复 token 过期没跳转
```

完整流程（分支怎么切、PR 怎么提）看 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 单元测试

用的是 Vitest，**不需要开小程序开发者工具就能跑**。

原理：测试环境里把 `view` / `text` / `button` 这些小程序标签当普通标签渲染，
再用 `tests/setup.ts` 伪造一套 `uni.request` / `uni.getStorageSync`。
所以纯逻辑和组件都能在电脑上直接测。

```bash
npm run test              # 36 个用例，大概 1.5 秒
```

## 自动检查（CI）

每次 push 到 `main` 或者开 PR，GitHub 会自动跑一遍 `.github/workflows/ci.yml`：

| 跑什么             | 内容                                                   |
| ------------------ | ------------------------------------------------------ |
| 规范 / 类型 / 测试 | ESLint → 类型检查 → 36 个单元测试                      |
| 三端小程序构建     | 微信 / 支付宝 / 抖音 各编译一遍 + 检查主包有没有超 2MB |

跑在 GitHub 自己的服务器上，**跟你本地网络没关系**（本地连不上 GitHub 也不影响它）。
构建产物会保留 7 天，测试的同学可以直接下载，不用本地跑一遍。

**在哪看结果**：仓库页面 → `Actions` 标签。开 PR 的话结果会直接显示在 PR 页面下方。

## 已知的坑

- **`vite` 不能升级**，必须是 `5.2.8`，原因见上面的版本表
- **`sass` 钉在 `~1.77.8`**：版本再高会一直刷弃用警告（噪音，不影响功能）
- **分支保护还没开**：`main` 目前谁都能直接推。约定是都走 PR，
  但这是靠自觉。等大家跑顺了可以去 `Settings → Rules` 打开强制
- 编译时会看到 `The CJS build of Vite's Node API is deprecated` 这句提示，
  是 vitest 加载配置的方式导致的，**不影响使用**，不用管它
