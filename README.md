# uni-app-template

uni-app（Vue 3 + Vite + TypeScript）**多端小程序**前端工程。

一套代码同时编译到 **微信小程序 / 支付宝小程序 / 抖音小程序**，H5 仅用于本地快速调试。

- 分层结构、状态管理、请求封装、多环境、代码规范、单元测试已全部就位
- 组件库接入 [wot-design-uni](https://wot-design-uni.netlify.app/)，easycom 自动引入
- 主包 / 分包已分离，微信分包优化已开启
- Git 提交规范由 husky 强制，CI 自动检查
- 协作流程见 [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 支持平台

| 平台           | 开发                     | 构建                       | 产物目录            |
| -------------- | ------------------------ | -------------------------- | ------------------- |
| 微信小程序     | `npm run dev:mp-weixin`  | `npm run build:mp-weixin`  | `dist/*/mp-weixin`  |
| 支付宝小程序   | `npm run dev:mp-alipay`  | `npm run build:mp-alipay`  | `dist/*/mp-alipay`  |
| 抖音小程序     | `npm run dev:mp-toutiao` | `npm run build:mp-toutiao` | `dist/*/mp-toutiao` |
| H5（仅调试用） | `npm run dev:h5`         | `npm run build:h5`         | `dist/*/h5`         |

三端一键构建：`npm run build:mp-all`

## 技术栈版本

| 依赖             | 版本                       | 说明                                              |
| ---------------- | -------------------------- | ------------------------------------------------- |
| `@dcloudio/*`    | `3.0.0-5020620260917001`   | uni-app vue3 分支（`vue3` dist-tag）              |
| `vite`           | `5.2.8`                    | **被 uni-app 的 peerDependencies 锁死，不要升级** |
| `vue`            | `^3.4.21`                  |                                                   |
| `pinia`          | `^3.0.4`                   | 配套 `pinia-plugin-persistedstate@^4`             |
| `wot-design-uni` | `^1.14.0`                  | UI 组件库                                         |
| `typescript`     | `~5.9.3`                   |                                                   |
| `vitest`         | `^2.1.9`                   | 必须留在 2.x，3.x 起要求 vite 6+                  |
| Node             | `>=20.19.0`（见 `.nvmrc`） | 团队统一用 Node 24                                |

> 版本对齐的坑：最新版 `@vitejs/plugin-vue@6`、`vitest@5` 都要求 vite 6/7，
> 而 uni-app 明确把 peer 钉在 `vite@5.2.8`，所以整条工具链只能停在 vite 5 兼容线。

## 目录结构

```
.
├─ .github/                # PR / Issue 模板、CI 配置
│  └─ workflows/ci.yml
├─ src
│  ├─ api/                 # 接口层
│  │  ├─ modules/          # 按业务模块拆分（user.ts / home.ts）
│  │  ├─ types.ts          # 请求 / 响应的领域模型
│  │  └─ index.ts
│  ├─ components/          # easycom 组件：目录名 = 标签名
│  │  └─ app-empty/app-empty.vue
│  ├─ composables/         # 组合式函数（useRequest / useTheme）
│  ├─ config/              # 统一读取 import.meta.env
│  ├─ pages/               # 主包页面，与 pages.json 一一对应
│  ├─ pages-sub/           # 分包页面（业务页面优先放这里）
│  │  └─ blank/blank.vue
│  ├─ static/              # 静态资源
│  ├─ store/               # Pinia
│  │  ├─ modules/          # app / user
│  │  └─ persist.ts        # uni 存储适配器
│  ├─ types/               # 通用工具类型
│  ├─ utils/               # request / storage / auth / format
│  ├─ App.vue              # 全局样式
│  ├─ main.ts              # createSSRApp + 挂载 Pinia
│  ├─ manifest.json        # 各端 appid 与平台配置
│  ├─ pages.json           # 路由 / tabBar / 分包 / easycom
│  └─ uni.scss             # 主题变量，会被自动注入到每个 scss 块
├─ tests
│  ├─ setup.ts             # uni API 替身
│  ├─ unit/
│  └─ components/
├─ CONTRIBUTING.md         # 团队协作规范（新人必读）
└─ 配置文件：vite / vitest / tsconfig / eslint / prettier / commitlint
```

## 快速开始

```bash
npm install                 # 需要 Node >= 20.19，团队统一 Node 24
npm run dev:mp-weixin       # 这个命令要一直开着，它负责实时编译
```

然后用**微信开发者工具**导入 `dist/dev/mp-weixin` 目录即可预览。

> ⚠️ 导入的是 `dist/dev/mp-weixin`，**不是项目根目录**。
> 根目录没有 `app.json`，导错了开发者工具会报「在项目根目录未找到 app.json」。

### 小程序端 appid

**不需要注册小程序，用微信的测试号就行**（1 分钟）：

1. 打开 https://mp.weixin.qq.com/wxamp/sandbox?doc=1 ，微信扫码，立刻拿到一个测试号
2. 把自己的 appid 填进 `src/manifest.json` 的 `mp-weixin.appid`
3. 填完**立刻**执行这条，让 git 忽略你这一处改动：

   ```bash
   git update-index --skip-worktree src/manifest.json
   ```

**为什么必须做第 3 步**：测试号是**个人的**，每个人的 appid 都不一样，
不忽略的话你一提交就会把别人的覆盖掉。

**如果现阶段只写页面、不碰微信登录** —— 连测试号都不用申请，
`manifest.json` 留空就是游客模式，模拟器里完全够用。

支付宝 / 抖音端同理，配置分别在 `mp-alipay`、`mp-toutiao` 节点下。

### 合法域名

开发者工具里勾选「不校验合法域名」，否则本地联调会被拦。
（详见 [CONTRIBUTING.md](./CONTRIBUTING.md) 第 5 节）

## 常用命令

```bash
npm run dev:h5 / dev:mp-weixin / dev:mp-alipay / dev:mp-toutiao
npm run build:h5 / build:mp-weixin / build:mp-alipay / build:mp-toutiao
npm run build:mp-all      # 三端一起构建
npm run type-check        # vue-tsc 类型检查
npm run lint              # ESLint 检查并自动修复
npm run lint:check        # ESLint 只检查不修复（CI 用的就是这个）
npm run format            # Prettier 格式化
npm run test              # 单元测试
npm run test:coverage     # 带覆盖率
```

## 多环境变量

`src/config/index.ts` 是唯一读取 `import.meta.env` 的地方，业务代码从这里 import 常量。

| 文件                | 提交？ | 用途                                                   |
| ------------------- | ------ | ------------------------------------------------------ |
| `.env`              | 是     | 所有环境共享（标题、超时、业务码、存储前缀）           |
| `.env.development`  | 是     | 团队共用的开发配置                                     |
| `.env.production`   | 是     | 生产环境，填真实网关地址                               |
| `.env.<mode>.local` | **否** | 个人本地覆盖，从 `.env.development.local.example` 复制 |

**本地环境隔离**：vite 的加载顺序是 `.env` → `.env.local` → `.env.<mode>` → `.env.<mode>.local`，
**后面的覆盖前面的**。所以个人覆盖必须用 `.env.<mode>.local`（开发环境即 `.env.development.local`），
写进 `.env.local` 会被 `.env.development` 压掉、不生效。

小程序联调是本机覆盖的典型场景 —— 小程序不走 vite 代理，必须写后端绝对地址：

```
VITE_API_BASE_URL=http://127.0.0.1:8080
VITE_USE_MOCK=false
```

这个文件已被 gitignore 忽略，不会影响同事。示例见 `.env.development.local.example`。

新增变量时记得同步在 `src/env.d.ts` 里补类型声明。
只有 `VITE_` 前缀的变量才会暴露给客户端代码。

## 请求封装

`src/utils/request.ts` 提供 `request / get / post / put / del`：

- 自动拼接 `API_BASE_URL`（绝对地址原样放行）
- 自动注入 `Authorization: Bearer <token>`，登录接口传 `{ auth: false }` 关闭
- 按 `code` 校验业务结果，成功直接 resolve `data`；命中登录失效码会清本地 token
- `loading: true` 时用计数器管理全局 loading，并发请求不会互相关闭
- `toast: false` 可关闭失败自动提示
- 失败统一抛 `RequestError`，携带 `code` 与原始 `data`

页面里推荐配合 `useRequest` 使用，省掉手写 try-catch：

```ts
const { data, loading, error, run } = useRequest(homeApi.getArticles)
await run({ page: 1, pageSize: 10 })
```

## 状态管理

Pinia 使用 setup 语法，持久化通过 `pinia-plugin-persistedstate`，
存储介质已在 `src/store/persist.ts` 换成 `uni.getStorageSync`（默认的 localStorage 在小程序端不存在）。

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

## 组件库

[wot-design-uni](https://wot-design-uni.netlify.app/) 已通过 easycom 接入，
模板里直接写 `<wd-button>` 就会被自动引入，**不需要 import，也不会打进未用到的组件**：

```vue
<wd-button type="primary" @click="onClick">提交</wd-button>
<wd-cell title="当前平台" :value="platform" />
```

- 类型提示：`tsconfig.json` 的 `types` 里已加 `wot-design-uni/global`，编辑器里有完整补全
- 主题定制：组件内部走 **CSS 自定义属性**（`var(--wot-color-theme, ...)`），
  所以在 `App.vue` 的全局样式里覆盖 CSS 变量即可，不需要重编译 SCSS
- 可用组件清单见官方文档，或直接看 `node_modules/wot-design-uni/components/`

## 页面分层与分包

**主包只放 tabBar 页和启动必需页；所有业务页面一律进分包。**

微信小程序主包上限 2MB，一旦超了就无法上传，而且这个问题只会在功能堆到一定程度后突然爆发。
所以从第一天就把 `src/pages-sub/` 用起来：

```jsonc
// src/pages.json
"subPackages": [
  { "root": "pages-sub", "pages": [{ "path": "blank/blank" }] }
]
```

对应文件是 `src/pages-sub/blank/blank.vue`，跳转路径为 `/pages-sub/blank/blank`。
写新页面时复制它改就行。

约定：分包可以引用主包的公共模块，**反过来不行**——
所以 `utils` / `store` / `api` 这些公共层必须留在主包（它们本来就在 `src/` 下，天然满足）。

## 代码规范与提交

提交前由 husky 自动把关（无法绕过，除非 `--no-verify`，不建议）：

- `pre-commit` → `lint-staged`：对暂存文件跑 `eslint --fix` + `prettier --write`
- `commit-msg` → `commitlint`：校验提交信息格式

允许的 type：`feat / fix / docs / style / refactor / perf / test / build / ci / chore / revert`

```
feat: 新增登录页
fix: 修复 token 过期未跳转
```

完整协作流程（分支模型、Review 清单、新人上手）见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 单元测试

Vitest + Vue Test Utils + jsdom。测试不经过 uni-app 编译器：

- `vitest.config.ts` 把 `view / text / button` 等 uni 内置标签注册为自定义元素
- `tests/setup.ts` 用替身实现 `uni.request / getStorageSync` 等 API

因此组件与逻辑都能在纯 Node 环境下直接跑，不需要开小程序开发者工具：

```bash
npm run test              # 36 个用例，约 1.5 秒
```

## CI

`.github/workflows/ci.yml`，每次 push 到 `main` 或开 PR 时自动跑：

| Job                | 内容                                                       |
| ------------------ | ---------------------------------------------------------- |
| 规范 / 类型 / 测试 | ESLint → vue-tsc → 36 个单元测试                           |
| 三端小程序构建     | 微信 / 支付宝 / 抖音编译 + 主包体积检查（超 2MB 直接失败） |

跑在 GitHub 自己的服务器上，不经过本地网络（所以本地连不上 GitHub 也不影响它）。
构建产物会作为 artifact 保留 7 天，测试同学不用本地跑构建就能下载。

**查看结果**：仓库页面 → `Actions` 标签。

## 已知约束

- `vite` 必须保持 `5.2.8`，升级前先确认 uni-app 放开了 peer 约束
- `sass` 钉在 `~1.77.8`：vite 5.2.8 没有 `css.preprocessorOptions.scss.api` 选项，
  只能走 legacy JS API，而 Dart Sass 1.80+ 每次编译都会刷弃用告警
- 使用 npm（未提供 pnpm / yarn 配置）
- **分支保护尚未开启**：`main` 目前谁都能直接 push。协作流程目前靠自觉遵守，
  等团队跑顺了建议去 `Settings → Rules` 打开「Require a pull request」变成强制
- 构建时会看到 `The CJS build of Vite's Node API is deprecated`，来自 vitest 加载配置的方式，
  给项目加 `"type": "module"` 可以消掉，但会影响 uni CLI，故保留
