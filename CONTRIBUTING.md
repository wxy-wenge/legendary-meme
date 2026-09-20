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

使用 **HBuilderX**。有两点需要注意：

**1. 编译必须走 npm 命令**

「运行 / 发行」菜单是给 HBuilderX 创建的项目用的，对 npm 项目不生效：

```bash
npm run dev:mp-weixin
```

这条命令要**一直开着**，改代码后会自动重新编译。可以配到「工具 → 外部命令」里一键执行。

**2. 微信开发者工具导入的是 `dist/dev/mp-weixin`**

不是项目根目录。导错了会报「在项目根目录未找到 app.json」。

> 格式化请交给 Prettier，不要用编辑器自带格式化，否则一提交就是一整篇 diff。

### 安装依赖

```bash
npm install
```

装完 husky 钩子会自动生效（`prepare` 脚本），可以用 `git config core.hooksPath` 确认输出 `.husky/_`。

### 连不上 GitHub

`git clone` / `git push` 超时是**常见现象**，不是你的问题。先用 **SSH over 443**：

```bash
# ~/.ssh/config
Host github.com
  HostName ssh.github.com
  Port 443
  User git
```

配好后 `ssh -T git@github.com` 应返回 `Hi <你的用户名>! You've successfully authenticated`。

**另外：推送偶尔会失败**，报 `Connection timed out` 之类。
提交已经存在本地了不会丢，**直接再敲一遍 `git push`**，通常两三次内就过。

---

## 1. 分支模型

`main` 保持可发布状态，只接受 PR，不要直接往上 push。

> 目前这条是靠自觉遵守的（仓库还没开强制分支保护）。等大家跑顺了，
> 建议去仓库 `Settings → Rules` 打开「Require a pull request before merging」，把它变成系统强制。

| 分支           | 用途               | 从哪切 | 合到哪 |
| -------------- | ------------------ | ------ | ------ |
| `main`         | 稳定主干           | —      | —      |
| `feat/<描述>`  | 新功能             | `main` | `main` |
| `fix/<描述>`   | 修 bug             | `main` | `main` |
| `chore/<描述>` | 依赖升级、配置调整 | `main` | `main` |

描述用短横线连接，简短表意，**可以用中文**：`feat/课程列表`、`fix/登录失效`。

分支要短命。一个分支活过一周，就会开始和 `main` 打架。

## 2. 开发流程

```bash
# 1. 从最新的 main 切分支
git switch main
git pull
git switch -c feat/课程列表

# 2. 开发，随时小步提交
git add -A
git commit -m "feat: 课程列表页"

# 3. 推送前本地自测（见下方「自测三件套」）
npm run lint:check
npm run type-check
npm run test

# 4. 推送
git push -u origin feat/课程列表
```

**第 4 步执行完终端会打印一个网址**，打开它就是开 PR 的页面，按模板填写即可。

### 自测三件套

**PR 之前必须自己跑一遍。**

```bash
npm run lint:check      # 代码规范
npm run type-check      # 类型
npm run test            # 单元测试
```

CI 也会自动跑这三条，但等 CI 反馈要两分钟，本地只要十秒 —— **早发现早改，别浪费一轮 PR**。

另外，**任何影响页面的改动都要在小程序开发者工具里跑一遍**，别只跑 H5。
多端项目里 H5 能过、小程序挂掉是常态。

### CI 会自动检查什么

push 之后 GitHub Actions 会自动跑：规范检查 → 类型检查 → 单元测试 → 三端小程序构建。

结果显示在 **PR 页面上**（底部一排绿勾/红叉），也可以在仓库的 **`Actions`** 标签里看完整日志。

**CI 红了不要急着合并**，点进去看是哪个 job 挂的，修完再推一次。

### 合并

- 至少 **1 人 Review** 通过
- Review 意见全部处理完（改了，或者说明为什么不改）
- **CI 全绿**
- 合并后删掉远程分支

## 3. 提交信息规范

husky 已强制校验，格式不对直接提交失败。

```
<type>(<可选 scope>): <描述>
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
feat: 新增课程列表页
fix: 修复 token 过期未跳转
docs: 补充分包约定说明
```

**不要**写 `update`、`fix bug`、`111`、`.` 这种。半年后没人看得懂。

## 4. 代码分层约束（硬性）

这是本仓库最重要的约定，**Review 时优先看这几条**：

| 规则                                                             | 原因                                            |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| 业务代码**不得**直接读 `import.meta.env`，只能从 `src/config` 拿 | 环境变量散落各处后，改配置要全局搜，必然漏      |
| 网络请求**不得**直接调 `uni.request`，只能走 `src/utils/request` | 否则 token、错误码、loading、错误提示全部要重写 |
| 接口定义放 `src/api/modules/`，页面里不拼 URL                    | 接口地址集中管理，后端改路径只改一处            |
| 跨页面共享的状态放 `src/store`，页面内状态用 `ref`               | 滥用全局 store 会让数据流不可追踪               |
| 可复用逻辑抽到 `src/composables`，不要复制粘贴                   | 复制三遍之后，改 bug 要改三处还容易漏           |
| 业务页面放 `src/pages-sub/`，主包只放 tabBar 页                  | 微信主包 2MB 硬上限                             |

**`src/utils/` 和 `src/config/` 属于公共地基，要改先在群里说一声**（一改全项目都受影响）。

## 5. 小程序开发注意事项

### appid：每个人用自己的测试号

**不需要注册小程序、不需要营业执照。** 微信提供了测试号，扫码就有：

1. 打开 https://mp.weixin.qq.com/wxamp/sandbox?doc=1 ，微信扫码，立刻拿到一个测试号
2. 能真机预览、能调 `uni.login` 这类需要 appid 的接口
3. 把自己的 appid 填进 `src/manifest.json` 的 `mp-weixin.appid`
4. **填完立刻执行**：

   ```bash
   git update-index --skip-worktree src/manifest.json
   ```

**为什么第 4 步是必须的**：测试号是**跟个人微信绑定的**，每个人的 appid 都不一样。
不做这一步，你一提交就会把别人的 appid 覆盖掉，所有人的开发者工具都得重配。

想恢复跟踪（比如以后统一改用正式 appid）：

```bash
git update-index --no-skip-worktree src/manifest.json
```

**如果现阶段只写页面、不碰微信登录** —— 连测试号都不用申请，
`manifest.json` 留空就是游客模式，模拟器里完全够用。

### 合法域名

- 开发阶段：开发者工具 → 详情 → 本地设置 → 勾选「不校验合法域名」
- 正式发布前：必须在小程序后台配置 request 合法域名，否则线上全部请求失败

### 主包体积

微信主包上限 **2MB**，超了直接无法上传，CI 里也有一条会拦。养成习惯：

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

- [ ] **CI 是否全绿**（红了先看日志，别直接合）
- [ ] 有没有违反「[代码分层约束](#4-代码分层约束硬性)」的六条
- [ ] 有没有把**个人 appid** / 密钥 / 本机地址提交上来
- [ ] 新页面有没有放进分包，有没有往主包塞大资源
- [ ] 请求是否走了 `utils/request`，错误分支是否有处理
- [ ] 有没有需要补的单测（纯函数、store、工具类必须有）
- [ ] 条件编译的代码是否在对应平台验证过
- [ ] 有没有留下 `console.log`、调试代码、注释掉的大段旧代码

## 8. 新人上手 Checklist

- [ ] `nvm use 24`，`node -v` 确认是 v24.x
- [ ] `git clone` 成功（连不上就看[第 0 节的 443 配置](#连不上-github)）
- [ ] `npm install` 成功
- [ ] `git config core.hooksPath` 输出 `.husky/_`
- [ ] `npm run test` 全绿
- [ ] `npm run dev:mp-weixin` 能起，微信开发者工具能导入 `dist/dev/mp-weixin`
- [ ] 申请测试号并填进 `src/manifest.json`，执行了 `skip-worktree`
      （不碰微信登录的话可跳过）
- [ ] 读一遍[第 4 节「代码分层约束」](#4-代码分层约束硬性)
- [ ] 切一个 `feat/xxx` 分支，走完一次完整的 PR 流程
