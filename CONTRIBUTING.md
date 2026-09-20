# 协作规范

我们几个人一起在这个仓库里写代码。下面是约定，**新人第一天看一遍**就行，之后当速查表用。

> 这个仓库只有**前端**。后端是另一个仓库，见文末「[后端在哪](#后端在哪)」。

---

## 1. 先把环境跑起来

### 装 Node

去 https://nodejs.org 下 **Node 24**，装完在终端里确认：

```bash
node -v      # 应该显示 v24.x
```

大家版本统一一下，不然会出现各种奇怪的报错。

### 用 HBuilderX

默认用 HBuilderX，两件事记住：

**① 编译要在终端里跑，不能用「运行 / 发行」菜单**

```bash
npm run dev:mp-weixin
```

这条命令**要一直开着**，它负责实时编译你改的代码。可以配到「工具 → 外部命令」里一键执行。

**② 微信开发者工具导入的是 `dist/dev/mp-weixin`**

不是项目根目录。导错了会报「在项目根目录未找到 app.json」。

### 装依赖

```bash
npm install
```

### 连不上 GitHub

clone / push 超时是很常见的，不是你操作错了。

新建（或编辑）`C:\Users\你的用户名\.ssh\config`，写入：

```
Host github.com
  HostName ssh.github.com
  Port 443
  User git
```

然后执行 `ssh -T git@github.com`，看到 `Hi 你的用户名!` 就配好了。

**推送偶尔会失败**，报 `timed out` 之类的。你的提交不会丢，**再敲一遍 `git push`** 就行，一般两三次就过。

---

## 2. 每天怎么干活

```bash
# 1. 先同步最新代码
git switch main
git pull

# 2. 建一个自己的分支（名字 = 你要做的事，中文也行）
git switch -c feat/课程列表

# 3. 写代码……

# 4. 提交（不用等全写完才提交，可以随时存一下）
git add -A
git commit -m "feat: 课程列表页"

# 5. 推到 GitHub
git push -u origin feat/课程列表
```

**第 5 步执行完，终端会打印一个网址**，打开它就是开 PR 的页面。

### 推送之前顺手跑一下

```bash
npm run lint:check
npm run type-check
npm run test
```

三条加起来十秒。CI 也会帮你跑，但等 CI 反馈要两分钟，**自己先跑能省一轮来回**。

**另外一定要在小程序开发者工具里点开看看** —— 只跑 H5 是不够的，多端项目里 H5 正常、小程序挂掉很常见。

### PR 开好之后

GitHub 会自动跑检查（CI），结果在 PR 页面下方：

- **绿了** → 找个人看一眼，然后点 `Merge` 合并
- **红了** → 点进去看是哪个步骤挂的，改完再 `git add / commit / push` 一次，CI 会自动重跑

合并之后回到主线：

```bash
git switch main
git pull
git branch -d feat/课程列表
```

---

## 3. 提交信息怎么写

**必须写成 `类型: 描述` 的格式**，写错了会被拦下来提交不了。

常用的几个类型：

| 类型       | 什么时候用                     |
| ---------- | ------------------------------ |
| `feat`     | 加了新功能                     |
| `fix`      | 修了 bug                       |
| `docs`     | 只改了文档                     |
| `style`    | 只调格式，不影响功能           |
| `refactor` | 重构（没加功能也没修 bug）     |
| `chore`    | 杂活（改配置、升依赖、改脚本） |

```
feat: 新增课程列表页
fix: 修复登录后不跳转
```

别写 `更新`、`修改一下`、`111` 这种 —— 过两天自己都看不懂了。

---

## 4. 几条重要的约定

写代码时注意这几条。**主要目的是少返工、少冲突**，不是为了规矩好看。

| 约定                                                       | 为什么                                    |
| ---------------------------------------------------------- | ----------------------------------------- |
| 接口地址写在 `src/api/modules/` 里，页面里不要拼 URL       | 后端改地址时你只改一个文件                |
| 发请求用 `src/utils/request.ts`，不要直接写 `uni.request`  | token、错误提示、loading 它都帮你处理好了 |
| 要读环境变量从 `src/config` 拿，别直接写 `import.meta.env` | 配置散开以后找不到，改一处漏一处          |
| 页面间共享的数据放 `src/store`，只这个页面用的就用 `ref`   | 全局状态堆太多会乱                        |
| 重复的逻辑抽到 `src/composables`，别复制粘贴               | 复制三份以后改 bug 要改三处               |
| 新页面放 `src/pages-sub/`，主包只放 tabBar 页              | 微信主包超过 2MB 就传不上去了             |

**`src/utils/` 和 `src/config/` 是大家共用的，要改先在群里说一声。**

---

## 5. 小程序要注意的

### appid：用自己的测试号

**不用注册小程序**，微信有测试号，扫码就给：

1. 打开 https://mp.weixin.qq.com/wxamp/sandbox?doc=1 ，微信扫码
2. 把拿到的 appid 填进 `src/manifest.json` 的 `mp-weixin.appid`
3. **填完马上执行这条**：

   ```bash
   git update-index --skip-worktree src/manifest.json
   ```

**第 3 步必须做。** 测试号是绑个人微信的，**每个人的 appid 都不一样**，
不做这一步，你一提交就会把别人的覆盖掉，所有人得重配。

以后想恢复跟踪（比如统一换成正式 appid）：

```bash
git update-index --no-skip-worktree src/manifest.json
```

**只写页面、不碰微信登录的话，这一步可以整个跳过** ——
`manifest.json` 留空就是游客模式，模拟器里够用。

### 合法域名

微信开发者工具 → 详情 → 本地设置 → 勾上「不校验合法域名」。
不勾的话本地调接口会被拦下来。

### 主包不能超过 2MB

这是微信的硬限制，超了传不上去，CI 里也有一条会拦。所以：

- 新页面一律放 `src/pages-sub/`
- 大图片别放 `src/static`，用图床
- 在开发者工具「详情 → 基本信息」里能看到当前体积

### 三个端不一样的地方

大部分代码三端通用。真遇到只有某个端才有的差别，用条件编译：

```ts
// #ifdef MP-WEIXIN
const login = () => uni.login({ provider: 'weixin' })
// #endif
```

**不要**在 `src/utils` / `src/store` 里写这个，会让人工写的单元测试失效。
条件编译的代码要在对应平台跑过再提交。

---

## 6. 新人第一天

- [ ] 装 Node 24
- [ ] 配好 GitHub 的 443 通道，`git clone` 下来
- [ ] `npm install`
- [ ] `npm run dev:mp-weixin` 能起得来
- [ ] 微信开发者工具导入 `dist/dev/mp-weixin`，能看到页面
- [ ] `npm run test` 全绿
- [ ] 回头看一下上面第 4 节
- [ ] 切个分支随便改点东西，走一遍 提交 → PR → 合并

---

## 后端在哪

**这个仓库只有前端**，后端是另一个仓库。

| 你要做的         | 去哪                                       |
| ---------------- | ------------------------------------------ |
| 写页面、调接口   | **本仓库**，接口写在 `src/api/modules/` 里 |
| 写接口、建数据库 | **后端仓库**                               |
| 约定接口长什么样 | 两边一起定                                 |

**两边一定要提前说好接口格式。** 后端的返回必须是 `{ code, message, data }`
（详见 [README 的「与后端对接」](./README.md#与后端对接)），
不然格式对不上，前端得跟着改代码。
