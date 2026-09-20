# uni-app-template

uni-app（Vue 3 + Vite + TypeScript）工程模板，开箱即用的分层结构、状态管理、请求封装、多环境、代码规范与单元测试。

## 技术栈版本

| 依赖          | 版本                     | 说明                                              |
| ------------- | ------------------------ | ------------------------------------------------- |
| `@dcloudio/*` | `3.0.0-5020620260917001` | uni-app vue3 分支（`vue3` dist-tag）              |
| `vite`        | `5.2.8`                  | **被 uni-app 的 peerDependencies 锁死，不要升级** |
| `vue`         | `^3.4.21`                |                                                   |
| `pinia`       | `^3.0.4`                 | 配套 `pinia-plugin-persistedstate@^4`             |
| `typescript`  | `~5.9.3`                 |                                                   |
| `vitest`      | `^2.1.9`                 | 必须留在 2.x，3.x 起要求 vite 6+                  |

> 版本对齐的坑：最新版 `@vitejs/plugin-vue@6`、`vitest@5` 都要求 vite 6/7，
> 而 uni-app 明确把 peer 钉在 `vite@5.2.8`，所以整条工具链只能停在 vite 5 兼容线。

## 目录结构

```
.
├─ src
│  ├─ api/                 # 接口层
│  │  ├─ modules/          # 按业务模块拆分（user.ts / home.ts）
│  │  ├─ types.ts          # 请求 / 响应的领域模型
│  │  └─ index.ts
│  ├─ components/          # easycom 组件：目录名 = 标签名
│  │  └─ app-empty/app-empty.vue
│  ├─ composables/         # 组合式函数（useRequest / useTheme）
│  ├─ config/              # 统一读取 import.meta.env
│  ├─ pages/               # 页面，与 pages.json 一一对应
│  ├─ static/              # 静态资源
│  ├─ store/               # Pinia
│  │  ├─ modules/          # app / user
│  │  └─ persist.ts        # uni 存储适配器
│  ├─ types/               # 通用工具类型
│  ├─ utils/               # request / storage / auth / format
│  ├─ App.vue              # 全局样式
│  ├─ main.ts              # createSSRApp + 挂载 Pinia
│  ├─ manifest.json
│  ├─ pages.json
│  └─ uni.scss             # 主题变量，会被自动注入到每个 scss 块
├─ tests
│  ├─ setup.ts             # uni API 替身
│  ├─ unit/
│  └─ components/
└─ 配置文件：vite / vitest / tsconfig / eslint / prettier / commitlint
```

## 常用命令

```bash
npm run dev:h5            # H5 开发调试
npm run dev:mp-weixin     # 微信小程序（产物在 dist/dev/mp-weixin）
npm run dev:app           # App，需配合 HBuilderX 运行
npm run build:h5          # H5 生产构建
npm run build:mp-weixin   # 小程序生产构建
npm run type-check        # vue-tsc 类型检查
npm run lint              # ESLint 检查并自动修复
npm run format            # Prettier 格式化
npm run test              # 跑单元测试
npm run test:coverage     # 带覆盖率
```

## 多环境变量

`src/config/index.ts` 是唯一读取 `import.meta.env` 的地方，业务代码从这里 import 常量。

| 文件               | 用途                                         |
| ------------------ | -------------------------------------------- |
| `.env`             | 所有环境共享（标题、超时、业务码、存储前缀） |
| `.env.development` | 开发环境，走 vite proxy 规避跨域             |
| `.env.production`  | 生产环境，填真实网关地址                     |

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
存储介质已在 `src/store/persist.ts` 换成 `uni.getStorageSync`（默认的 localStorage 在小程序和 App 端不存在）。

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

## 组件约定

沿用 uni-app 的 easycom 规则：`src/components/组件名/组件名.vue` 可直接在模板里用，无需 import。

```vue
<app-empty title="暂无数据" show-retry @retry="load" />
```

## Git 提交规范

`git init` 后由 husky 接管：

- `pre-commit` → `lint-staged`（对暂存文件跑 ESLint --fix + Prettier）
- `commit-msg` → `commitlint` 校验提交信息

允许的 type：`feat / fix / docs / style / refactor / perf / test / build / ci / chore / revert`

```
feat: 新增登录页
fix: 修复 token 过期未跳转
```

## 单元测试

Vitest + Vue Test Utils + jsdom。测试不经过 uni-app 编译器：
`vitest.config.ts` 把 `view / text / button` 等 uni 内置标签注册为自定义元素，
`tests/setup.ts` 用替身实现 `uni.request / getStorageSync` 等 API，
因此组件与逻辑都能在纯 Node 环境下直接跑。

## 已知约束

- `vite` 必须保持 `5.2.8`，升级前先确认 uni-app 放开了 peer 约束
- `sass` 钉在 `~1.77.8`：vite 5.2.8 没有 `css.preprocessorOptions.scss.api` 选项，
  只能走 legacy JS API，而 Dart Sass 1.80+ 每次编译都会刷弃用告警
- 使用 npm（未提供 pnpm / yarn 配置）
- 小程序端需在 `src/manifest.json` 填 `mp-weixin.appid`，App 端需在 HBuilderX 里申请 `appid`
- 构建时会看到 `The CJS build of Vite's Node API is deprecated`，来自 vitest 加载配置的方式，
  给项目加 `"type": "module"` 可以消掉，但会影响 uni CLI，故保留
