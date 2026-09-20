# 协作规范

本文是团队在这个仓库里写代码的约定。**新人第一天请完整读一遍**，之后可以当速查表用。

---

## 0. 环境准备

### Node 版本

项目要求 **Node >= 20.19**，团队统一用 **Node 24**（写在 `.nvmrc`）。

```bash
nvm install 24      # 或用 fnm / 直接装 Node 24
nvm use 24
node -v             # 应输出 v24.x
```

> 版本不一致最容易引发的怪问题：`npm install` 报奇怪的 peer 错误、构建产物行为不一致。

### 编辑器

推荐 VS Code，仓库里已带 `.vscode/settings.json`（保存自动格式化）和 `.vscode/extensions.json`，
打开项目时按提示装推荐插件即可：Volar、ESLint、Prettier、EditorConfig。

用 HBuilderX 也可以，但**请把格式化交给 Prettier**，不要用编辑器自带格式化，否则一提交就是一整篇 diff。

### 安装依赖

```bash
npm install
```

装完 husky 钩子会自动生效（`prepare` 脚本），可以用 `git config core.hooksPath` 确认输出 `.husky/_`。

### 连不上 GitHub

如果 `git clone` / `git push` 走 HTTPS 一直超时，改用 **SSH over 443**：
GitHub 的 `github.com:443` 在部分网络下不通，但 `ssh.github.com:443` 是通的。

```bash
# ~/.ssh/config
Host github.com
  HostName ssh.github.com
  Port 443
  User git
```

配好后 `ssh -T git@github.com` 应返回 `Hi <你的用户名>! You've successfully authenticated`。
远程地址用 SSH 格式：`git@github.com:<组织>/<仓库>.git`。

---

## 1. 分支模型

`main` 是**受保护分支**，永远可发布，只接受 PR，不接受直接 push。

| 分支            | 用途                     | 从哪切 | 合到哪 |
| --------------- | ------------------------ | ------ | ------ |
| `main`          | 稳定主干                 | —      | —      |
| `feat/<描述>`   | 新功能                   | `main` | `main` |
| `fix/<描述>`    | 修 bug                   | `main` | `main` |
| `hotfix/<描述>` | 线上紧急修复             | `main` | `main` |
| `chore/<描述>`  | 依赖升级、配置调整、重构 | `main` | `main` |

描述用 kebab-case，简短表意：`feat/user-login`、`fix/cart-total-error`。

分支要短命。一个分支活过一周，就会开始和 `main` 打架。

## 2. 开发流程

```bash
# 1. 从最新的 main 切分支
git switch main && git pull
git switch -c feat/user-login

# 2. 开发，随时小步提交
git add -A
git commit -m "feat: 增加手机号登录表单"

# 3. 推送前必须本地自测（见下方「自测三件套」）
npm run lint
npm run type-check
npm run test

# 4. 推送并开 PR
git push -u origin feat/user-login
# 然后在 GitHub 上开 PR，按模板填写
```

### 自测三件套

**当前仓库没有 CI，所以这三条是唯一的质量闸门，PR 前必须自己跑。**

```bash
npm run lint:check      # 代码规范
npm run type-check      # 类型
npm run test            # 单元测试
```

另外，**任何影响页面的改动都要在小程序开发者工具里跑一遍**，别只跑 H5。
多端项目里 H5 能通过、小程序挂掉是常态。

### 合并

- 至少 **1 人 Review** 通过
- Review 意见全部处理完（改了或说明为什么不改）
- 用 **Squash merge**，保持 `main` 的提交历史一条线一件事
- 合并后删除远程分支

## 3. 提交信息规范

husky 已强制校验，格式不对直接提交失败。

```
<type>(<可选 scope>): <描述>

<可选正文，说明为什么这么改>

<可选 footer，如关联 issue>
```

允许的 type：

| type       | 用途                          |
| ---------- | ----------------------------- |
| `feat`     | 新功能                        |
| `fix`      | 修 bug                        |
| `docs`     | 只改文档                      |
| `style`    | 不影响逻辑的格式调整          |
| `refactor` | 重构（既不修 bug 也不加功能） |
| `perf`     | 性能优化                      |
| `test`     | 增删改测试                    |
| `build`    | 构建脚本 / 依赖变更           |
| `chore`    | 杂项                          |
| `revert`   | 回滚                          |

```
feat(user): 增加手机号验证码登录
fix: 修复购物车总价在小数位上精度丢失
docs: 补充分包约定说明
```

**不要**写 `update`、`fix bug`、`111`、`.` 这种。半年后没人看得懂。

## 4. 代码分层约束（硬性）

这是本模板最重要的约定，**Review 时优先看这几条**：

| 规则                                                             | 原因                                            |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| 业务代码**不得**直接读 `import.meta.env`，只能从 `src/config` 拿 | 环境变量散落各处后，改配置要全局搜，必然漏      |
| 网络请求**不得**直接调 `uni.request`，只能走 `src/utils/request` | 否则 token、错误码、loading、错误提示全部要重写 |
| 接口定义放 `src/api/modules/`，页面里不拼 URL                    | 接口地址集中管理，后端改路径只改一处            |
| 跨页面共享的状态放 `src/store`，页面内状态用 `ref`               | 滥用全局 store 会让数据流不可追踪               |
| 可复用逻辑抽到 `src/composables`，不要复制粘贴                   | 复制三遍之后，改 bug 要改三处还容易漏           |
| 业务页面放 `src/pages-sub/`，主包只放 tabBar 页                  | 微信主包 2MB 硬上限                             |

## 5. 小程序开发注意事项

### appid

团队共用的小程序 appid 填在 `src/manifest.json`，**这个文件要提交**。

个人临时用自己的测试号调试时：

```bash
# 改完 manifest.json 后执行，让 git 忽略你的本地改动
git update-index --skip-worktree src/manifest.json

# 想恢复跟踪
git update-index --no-skip-worktree src/manifest.json
```

**千万别把自己的 appid 提交上去**，会让所有人的开发者工具都打不开。

### 合法域名

- 开发阶段：开发者工具 → 详情 → 本地设置 → 勾选「不校验合法域名」
- 正式发布前：必须在小程序后台配置 request 合法域名，否则线上全部请求失败

### 主包体积

微信主包上限 **2MB**，超了直接无法上传。养成习惯：

- 新业务页面一律进 `src/pages-sub/`
- 图片放 CDN，不要往 `src/static` 里堆大图
- 定期在小程序开发者工具「详情 → 基本信息」看包体积

### 分包优化

`src/manifest.json` 里已开启 `mp-weixin.optimization.subPackages: true`，
它允许分包引用主包的公共模块。**反过来（主包引用分包）在任何情况下都不行。**

## 6. 多端适配约定

一套代码三端跑，差异是必然的。约定：

- **优先用 uni-app 的跨端组件和 API**，不要一上来就写平台条件编译
- 确实需要差异化时，用条件编译并把差异收在一处：

```ts
// #ifdef MP-WEIXIN
const login = () => uni.login({ provider: 'weixin' })
// #endif
// #ifdef MP-ALIPAY
const login = () => my.getAuthCode({ scopes: 'auth_base' })
// #endif
```

- **不要**在 `src/utils` / `src/store` 这类公共层里写条件编译，会让单元测试失效
  （vitest 不处理条件编译注释，所有分支都会被保留）
- 条件编译的代码**必须在对应平台真机或模拟器里验证过**再提交

## 7. Code Review 检查清单

Review 时按这个顺序看，前三条是硬性的：

- [ ] 有没有违反「代码分层约束」的六条
- [ ] 有没有把个人 appid / 密钥 / 本机地址提交上来
- [ ] 新页面有没有放进分包，有没有往主包塞大资源
- [ ] 请求是否走了 `utils/request`，错误分支是否有处理
- [ ] 有没有需要补的单测（纯函数、store、工具类必须有）
- [ ] 条件编译的代码是否在对应平台验证过
- [ ] 提交信息是否符合规范
- [ ] 有没有留下 `console.log`、调试代码、注释掉的大段旧代码

## 8. 新人上手 Checklist

- [ ] `nvm use 24`，`node -v` 确认是 v24.x
- [ ] `npm install` 成功
- [ ] `git config core.hooksPath` 输出 `.husky/_`
- [ ] `npm run test` 全绿
- [ ] `npm run dev:mp-weixin` 能起，开发者工具能导入 `dist/dev/mp-weixin`
- [ ] `src/manifest.json` 里的 appid 是团队的，不是自己的
- [ ] 读一遍本文件第 4 节「代码分层约束」
- [ ] 找个人要一个「good first issue」，走完一次完整的 PR 流程
