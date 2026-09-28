/**
 * 前端模拟层
 *
 * 作用：后端接口还没就绪时顶上去，让页面走的是**正常的请求链路**，
 * 而不是把假数据写死在页面里。这样后端一好，关掉开关就接上了，页面不用改。
 *
 * 开关：.env.development.local 里的 VITE_USE_MOCK
 *   true  → 所有接口都用这里的演示数据
 *   false → 请求真的发到后端；但 PENDING_ROUTES 里列的接口仍用演示数据兜底
 *
 * 认证部分的模拟行为已对照若依（RuoYi 3.9.2）源码核对：
 *   - 返回格式 { code, msg, ... }，成功码 200
 *   - 验证码是**数学题**（application.yml 里 captchaType: math）
 *   - 注册的校验顺序和提示语与 SysRegisterService 一致
 *   - 注册用户的昵称默认等于账号（SysRegisterService 里 setNickName(username)）
 */

import type {
  BannerItem,
  CourseDetail,
  CourseItem,
  CoverItem,
  LearnHistoryItem,
  PostComment,
  PostDetail,
  PostItem
} from './types'

const SUCCESS = 200
const FAIL = 500
const UNAUTHORIZED = 401

/** 与后端 UserConstants 保持一致 */
const USERNAME_MIN = 2
const USERNAME_MAX = 20
const PASSWORD_MIN = 5
const PASSWORD_MAX = 20

/**
 * 后端**还没有实现**的接口前缀：即使 VITE_USE_MOCK=false 也用演示数据兜底，
 * 否则本地开发时这些页面会全是空的。
 *
 * 后端把某个接口做出来之后，把对应前缀从这里删掉即可 ——
 * 留着的话，假数据会盖住真接口。
 */
const PENDING_ROUTES = ['/content/', '/learning/', '/community/']

export interface MockResponse {
  statusCode: number
  data: unknown
}

export interface MockRequestOptions {
  /** 已拼好 baseURL 的完整地址 */
  url: string
  method: string
  data?: unknown
  /**
   * 是否启用模拟层（来自 VITE_USE_MOCK）。
   * 传 false 时只保留 PENDING_ROUTES 里的兜底接口，其余交给真实请求。
   */
  useMock?: boolean
}

// ---------- 模拟状态（刷新页面就重置） ----------

/** uuid → 验证码答案 */
const captchaStore = new Map<string, string>()

/**
 * 账号 → 信息。
 * 预置的这个只是为了不用注册就能试登录，不需要的话删掉这一行即可。
 * 昵称和账号保持一致，跟后端注册用户的行为一样（不会凭空造中文昵称）。
 */
const users = new Map<string, { password: string; nickName: string }>([
  ['admin', { password: 'admin123', nickName: 'admin' }]
])

/** 当前登录的账号，getInfo 用它决定返回谁的信息 */
let currentUser: string | null = null

let uuidSeq = 0
let tokenSeq = 0

// ---------- 工具 ----------

function nextUuid(): string {
  uuidSeq += 1
  return `mock-uuid-${Date.now()}-${uuidSeq}`
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function body(data: Record<string, unknown>): MockResponse {
  return { statusCode: 200, data: { code: SUCCESS, msg: '操作成功', ...data } }
}

function error(msg: string, code = FAIL): MockResponse {
  return { statusCode: 200, data: { code, msg } }
}

function asRecord(data: unknown): Record<string, unknown> {
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
}

function str(data: Record<string, unknown>, key: string): string {
  const v = data[key]
  return v === undefined || v === null ? '' : String(v).trim()
}

/**
 * 生成数学验证码，规则照抄后端的 KaptchaTextCreator：
 * 随机两个 0-9 的数，随机做 * / + -，返回「算式」和「答案」。
 */
function makeMathCaptcha(): { text: string; answer: string } {
  const x = Math.floor(Math.random() * 10)
  const y = Math.floor(Math.random() * 10)
  const operands = Math.floor(Math.random() * 3)

  let answer: number
  let text: string

  if (operands === 0) {
    answer = x * y
    text = `${x}*${y}`
  } else if (operands === 1) {
    if (x !== 0 && y % x === 0) {
      answer = y / x
      text = `${y}/${x}`
    } else {
      answer = x + y
      text = `${x}+${y}`
    }
  } else if (x >= y) {
    answer = x - y
    text = `${x}-${y}`
  } else {
    answer = y - x
    text = `${y}-${x}`
  }

  return { text: `${text}=?`, answer: String(answer) }
}

// ---------- 认证 ----------

function mockCaptcha(): MockResponse {
  const uuid = nextUuid()
  const { text, answer } = makeMathCaptcha()
  captchaStore.set(uuid, answer)

  return body({
    captchaEnabled: true,
    uuid,
    // 真实若依返回 base64 图片；模拟层返回空 img + 算式文本，
    // 页面在没有 img 时会把算式当文字验证码显示，
    // 这样不依赖各端对 base64 图片的支持差异。
    img: '',
    mockText: text
  })
}

function mockLogin(raw: unknown): MockResponse {
  const data = asRecord(raw)
  const username = str(data, 'username')
  const password = str(data, 'password')
  const code = str(data, 'code')
  const uuid = str(data, 'uuid')

  const expected = captchaStore.get(uuid)
  if (expected === undefined) return error('验证码已失效，请刷新后重试')
  captchaStore.delete(uuid) // 验证码一次性
  if (code !== expected) return error('验证码错误')

  const user = users.get(username)
  if (!user || user.password !== password) return error('用户名或密码错误')

  tokenSeq += 1
  currentUser = username
  return body({ token: `mock-token-${tokenSeq}` })
}

function mockRegister(raw: unknown): MockResponse {
  const data = asRecord(raw)
  const username = str(data, 'username')
  const password = str(data, 'password')
  const code = str(data, 'code')
  const uuid = str(data, 'uuid')

  // 校验顺序与 SysRegisterService 保持一致
  const expected = captchaStore.get(uuid)
  if (expected === undefined) return error('验证码已失效，请刷新后重试')
  captchaStore.delete(uuid)
  if (code !== expected) return error('验证码错误')

  if (!username) return error('用户名不能为空')
  if (!password) return error('用户密码不能为空')
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return error(`账户长度必须在${USERNAME_MIN}到${USERNAME_MAX}个字符之间`)
  }
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return error(`密码长度必须在${PASSWORD_MIN}到${PASSWORD_MAX}个字符之间`)
  }
  if (users.has(username)) return error(`保存用户'${username}'失败，注册账号已存在`)

  // 后端也是把昵称设成账号（SysRegisterService: setNickName(username)）
  users.set(username, { password, nickName: username })
  return body({})
}

/**
 * 返回**当前登录账号**的信息。
 * 没有登录就返回 401，不编造任何用户数据。
 */
function mockGetInfo(): MockResponse {
  if (!currentUser) {
    return error('认证失败，无法访问系统资源', UNAUTHORIZED)
  }

  const user = users.get(currentUser)

  return body({
    user: {
      userId: 1,
      userName: currentUser,
      nickName: user?.nickName ?? currentUser,
      // 头像 / 手机号 / 邮箱 / 简介 / 身份标签后端没给就是空，页面对空值显示占位
      avatar: '',
      phonenumber: '',
      email: ''
    },
    roles: ['common'],
    permissions: []
  })
}

// ---------- 内容：演示数据 ----------
//
// 全部演示数据集中在这里，页面里不再写死任何内容。
// 正式接入后端后，这一整段可以删掉。

const demoBanners: BannerItem[] = [
  {
    id: 1,
    title: '本周精选课程',
    sub: '限时免费，先到先学',
    bg: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)'
  },
  {
    id: 2,
    title: '7 天学习打卡挑战',
    sub: '坚持打卡，赢取结课徽章',
    bg: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)'
  }
]

const demoCourses: CourseItem[] = [
  {
    id: 1,
    title: '机器学习实战：从原理到落地',
    type: 'video',
    category: '人工智能',
    emoji: '🤖',
    cover: 'linear-gradient(135deg, #818CF8 0%, #A78BFA 100%)',
    stars: 5,
    score: '4.9',
    learners: '12.3k'
  },
  {
    id: 2,
    title: '数据科学入门',
    type: 'article',
    category: '后端',
    emoji: '📊',
    cover: 'linear-gradient(135deg, #FBBF24 0%, #FB923C 100%)',
    stars: 5,
    score: '4.8',
    learners: '9.6k'
  },
  {
    id: 3,
    title: '数据分析与可视化',
    type: 'video',
    category: '后端',
    emoji: '📈',
    cover: 'linear-gradient(135deg, #22D3EE 0%, #38BDF8 100%)',
    stars: 4,
    score: '4.6',
    learners: '8.1k'
  },
  {
    id: 4,
    title: 'Web 前端入门',
    type: 'video',
    category: '前端',
    emoji: '💻',
    cover: 'linear-gradient(135deg, #F472B6 0%, #FB7185 100%)',
    stars: 5,
    score: '4.9',
    learners: '15.2k'
  },
  {
    id: 5,
    title: 'UI 设计基础',
    type: 'article',
    category: '设计',
    emoji: '🎨',
    cover: 'linear-gradient(135deg, #C084FC 0%, #F0ABFC 100%)',
    stars: 4,
    score: '4.7',
    learners: '7.4k'
  },
  {
    id: 6,
    title: 'Python 基础语法',
    type: 'article',
    category: '后端',
    emoji: '🐍',
    cover: 'linear-gradient(135deg, #34D399 0%, #4ADE80 100%)',
    stars: 5,
    score: '4.8',
    learners: '11.5k'
  },
  {
    id: 7,
    title: '多端小程序开发',
    type: 'video',
    category: '移动开发',
    emoji: '📱',
    cover: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)',
    stars: 4,
    score: '4.5',
    learners: '6.2k'
  },
  {
    id: 8,
    title: '产品经理入门',
    type: 'article',
    category: '产品',
    emoji: '🧭',
    cover: 'linear-gradient(135deg, #FB7185 0%, #F59E0B 100%)',
    stars: 4,
    score: '4.4',
    learners: '5.8k'
  }
]

const demoHotSearch = [
  '机器学习实战',
  'Web 前端入门',
  'Python 基础语法',
  '数据科学入门',
  'UI 设计基础'
]

const demoCourseDetail: CourseDetail = {
  ...demoCourses[0],
  author: '示例讲师',
  subtitle: '视频课 · 共 3 章',
  intro:
    '从零讲清机器学习的基本原理，再一路做到可运行的项目。课程按「先看懂、再动手」的顺序安排，每章都有配套练习，适合有基础编程经验、但没系统学过机器学习的同学。',
  outcomes: [
    '理解监督学习、无监督学习的基本框架',
    '独立完成数据清洗与特征工程',
    '掌握常见模型的训练与调参方法',
    '把模型部署成一个可调用的小服务'
  ],
  chapters: [
    {
      title: '第一章 基础概念',
      duration: '1 小时 20 分',
      lessons: [
        { title: '1-1 什么是机器学习', time: '12:30' },
        { title: '1-2 监督学习与无监督学习', time: '18:05' },
        { title: '1-3 环境准备与第一个例子', time: '26:40' }
      ]
    },
    {
      title: '第二章 数据处理',
      duration: '2 小时 05 分',
      lessons: [
        { title: '2-1 数据清洗', time: '24:10' },
        { title: '2-2 特征工程', time: '31:20' },
        { title: '2-3 数据集划分与交叉验证', time: '22:45' }
      ]
    },
    {
      title: '第三章 模型训练与部署',
      duration: '2 小时 40 分',
      lessons: [
        { title: '3-1 常见模型对比', time: '35:15' },
        { title: '3-2 调参与评估', time: '40:30' },
        { title: '3-3 部署成小服务', time: '45:00' }
      ]
    }
  ],
  distribution: [
    { star: 5, percent: 82 },
    { star: 4, percent: 13 },
    { star: 3, percent: 4 },
    { star: 2, percent: 1 },
    { star: 1, percent: 0 }
  ],
  reviews: [
    {
      name: '小林同学',
      stars: 5,
      time: '3 天前',
      content: '讲得比教材好懂，每章都有练习，跟着做一遍基本就理解了。'
    },
    {
      name: '阿杰',
      stars: 5,
      time: '1 周前',
      content: '第三章的部署部分很有用，以前只会训练模型，不知道怎么用起来。'
    },
    {
      name: '爱学习的鱼',
      stars: 4,
      time: '2 周前',
      content: '整体不错，数学推导部分如果能再补一点就更好了。'
    }
  ]
}

// ---------- 内容：接口实现 ----------

function mockBanners(): MockResponse {
  return body({ data: demoBanners })
}

function mockCourses(raw: unknown): MockResponse {
  const category = str(asRecord(raw), 'category')
  const rows =
    !category || category === '推荐'
      ? demoCourses
      : demoCourses.filter((item) => item.category === category)
  return body({ rows, total: rows.length })
}

function mockSearch(raw: unknown): MockResponse {
  const keyword = str(asRecord(raw), 'keyword')
  const rows = !keyword
    ? demoCourses
    : demoCourses.filter((item) => item.title.includes(keyword) || item.category.includes(keyword))
  return body({ rows, total: rows.length })
}

function mockHotSearch(): MockResponse {
  return body({ data: demoHotSearch })
}

function mockCourseDetail(raw: unknown): MockResponse {
  const id = Number(str(asRecord(raw), 'id'))
  const found = demoCourses.find((item) => item.id === id)

  // 演示数据只有第一条有完整详情，其余复用它的正文，免得点进去是空的
  return body({ data: found ? { ...demoCourseDetail, ...found } : demoCourseDetail })
}

// ---------- 学习记录：演示数据 + 接口 ----------

const demoHistory: LearnHistoryItem[] = [
  {
    id: 1,
    kind: 0,
    title: 'Vue3 组合式 API 实战',
    done: false,
    progress: '上次观看至第 3 节 进度 45%'
  },
  {
    id: 2,
    kind: 0,
    title: '小程序分包与性能优化',
    done: false,
    progress: '上次观看至第 7 节 进度 80%'
  },
  { id: 3, kind: 0, title: 'TypeScript 类型基础入门', done: true, progress: '' },
  {
    id: 4,
    kind: 1,
    title: 'JavaScript 高级程序设计',
    done: false,
    progress: '上次看至 128 页 第 4 章'
  },
  { id: 5, kind: 1, title: '深入理解计算机系统', done: false, progress: '上次看至 56 页 第 2 章' },
  { id: 6, kind: 1, title: '代码整洁之道', done: true, progress: '' }
]

const demoFavorites: CoverItem[] = [
  { id: 1, title: 'Vue3 组合式 API 实战' },
  { id: 2, title: '小程序分包与性能优化' },
  { id: 3, title: 'TypeScript 类型基础入门' }
]

const demoShelf: CoverItem[] = [
  { id: 1, title: 'JavaScript 高级程序设计' },
  { id: 2, title: '深入理解计算机系统' },
  { id: 3, title: '代码整洁之道' },
  { id: 4, title: '你不知道的 JavaScript' }
]

function listResponse<T>(rows: T[]): MockResponse {
  return body({ rows, total: rows.length })
}

// ---------- 社区：演示数据 + 接口 ----------

const demoPost: PostDetail = {
  id: 1,
  author: { userId: 2, nickName: '小林同学', avatar: '' },
  content:
    '今天把机器学习第三章的调参部分过完了，「网格搜索」和「随机搜索」的区别终于搞明白了 —— 简单说是前者穷举、后者随机采样，数据量大的时候随机搜索反而更划算。\n\n把自己的理解整理在下面，有不对的地方欢迎指正。',
  topic: '今日学习打卡',
  // 帖子配图等后端有了上传能力再补，这里先留空
  media: [],
  createTime: '2 小时前',
  likeCount: 28,
  commentCount: 3,
  liked: false,
  favorited: false
}

const demoComments: PostComment[] = [
  {
    id: 101,
    author: { userId: 3, nickName: '阿杰', avatar: '' },
    content: '总结得清楚，我卡在交叉验证那块好久，看完你这个明白了。',
    createTime: '1 小时前',
    likeCount: 6,
    replies: [
      {
        id: 10101,
        author: { userId: 2, nickName: '小林同学', avatar: '' },
        content: '交叉验证就是把训练集切几份轮流当验证集，多试几次结果更稳。',
        createTime: '50 分钟前',
        likeCount: 2
      }
    ]
  },
  {
    id: 102,
    author: { userId: 4, nickName: '爱学习的鱼', avatar: '' },
    content: '随机搜索确实香，我之前跑网格搜索跑了一整晚。',
    createTime: '40 分钟前',
    likeCount: 3
  },
  {
    id: 103,
    author: { userId: 5, nickName: 'Lily', avatar: '' },
    content: '有没有推荐的调参工具？现在还在手写循环。',
    createTime: '10 分钟前',
    likeCount: 0
  }
]

/** 新发的评论只活在这一次会话里，刷新后回到演示数据 */
let commentSeq = 0

/** 帖子列表演示数据：第一条和详情页那条是同一个，点进去内容对得上 */
const demoPosts: PostItem[] = [
  {
    id: 1,
    author: { userId: 2, nickName: '小林同学', avatar: '' },
    summary:
      '今天把机器学习第三章的调参部分过完了，「网格搜索」和「随机搜索」的区别终于搞明白了 —— 简单说是前者穷举、后者随机采样，数据量大的时候随机搜索反而更划算。',
    topic: '今日学习打卡',
    images: [],
    createTime: '2 小时前',
    likeCount: 28,
    commentCount: 3
  },
  {
    id: 2,
    author: { userId: 3, nickName: '阿杰', avatar: '' },
    summary:
      '用 uni-app 打包微信小程序，真机上一直提示「域名不合法」，开发者工具里明明是好的。是不是要在小程序后台配 request 合法域名才行？',
    topic: '求大佬解答',
    images: [],
    createTime: '3 小时前',
    likeCount: 12,
    commentCount: 5
  },
  {
    id: 3,
    author: { userId: 4, nickName: '爱学习的鱼', avatar: '' },
    summary:
      '今天把 Vue3 的响应式原理又看了一遍，终于理解 computed 为什么能缓存了 —— 它内部也是靠依赖收集，只是多存了一个 dirty 标记。',
    topic: '前端打卡',
    images: [],
    createTime: '5 小时前',
    likeCount: 45,
    commentCount: 8
  },
  {
    id: 4,
    author: { userId: 5, nickName: 'Lily', avatar: '' },
    summary:
      '算法打卡第 12 天，今天做了三道二分查找。踩了个坑：求中点写成 (left + right) / 2 在数据量大时会溢出，得用 left + (right - left) / 2。',
    topic: '算法刷题',
    images: [],
    createTime: '昨天',
    likeCount: 19,
    commentCount: 2
  },
  {
    id: 5,
    author: { userId: 6, nickName: '老张', avatar: '' },
    summary:
      '复盘一下这周的学习节奏：早上看视频、中午写练习、晚上整理笔记，比之前一口气学三小时效果好很多。推荐大家也试试拆成小块。',
    topic: '今日学习打卡',
    images: [],
    createTime: '昨天',
    likeCount: 33,
    commentCount: 6
  },
  {
    id: 6,
    author: { userId: 7, nickName: '小舟', avatar: '' },
    summary:
      '后端接口返回的时间格式是带 T 的（2026-09-24T10:30:00），前端怎么处理最省事？是在请求层统一转一次，还是每个页面自己转？',
    topic: '求大佬解答',
    images: [],
    createTime: '2 天前',
    likeCount: 8,
    commentCount: 4
  }
]

function mockPostList(raw: unknown): MockResponse {
  const topic = str(asRecord(raw), 'topic')
  const rows = !topic ? demoPosts : demoPosts.filter((item) => item.topic === topic)
  return body({ rows, total: rows.length })
}

/** 用户这次会话里发的帖子，刷新后清空 */
const createdPosts: PostDetail[] = []
let postSeq = 0

function mockCreatePost(raw: unknown): MockResponse {
  const data = asRecord(raw)
  const content = str(data, 'content')
  if (!content) return error('内容不能为空')

  const topic = str(data, 'topic')
  const images = Array.isArray(data.images) ? (data.images as string[]) : []

  postSeq += 1
  const id = 9000 + postSeq
  const author = { userId: 0, nickName: currentUser ?? '我', avatar: '' }

  createdPosts.push({
    id,
    author,
    content,
    topic,
    media: images.map((url) => ({ type: 'image' as const, url })),
    createTime: '刚刚',
    likeCount: 0,
    commentCount: 0,
    liked: false,
    favorited: false
  })

  // 顺手插到列表最前面，返回社区页就能看到自己刚发的
  demoPosts.unshift({
    id,
    author,
    summary: content,
    topic,
    images,
    createTime: '刚刚',
    likeCount: 0,
    commentCount: 0
  })

  return body({ data: { id } })
}

function mockPostDetail(raw: unknown): MockResponse {
  const id = Number(str(asRecord(raw), 'id'))
  const created = createdPosts.find((item) => item.id === id)
  return body({ data: created ?? demoPost })
}

/** 「我的帖子」：本次会话自己发的 + 两条预设的 */
function mockMyPosts(): MockResponse {
  const me = currentUser ?? '我'

  const mine: PostItem[] = createdPosts.map((item) => ({
    id: item.id,
    author: item.author,
    summary: item.content,
    topic: item.topic,
    images: item.media.map((media) => media.url),
    createTime: item.createTime,
    likeCount: item.likeCount,
    commentCount: item.commentCount
  }))

  const preset: PostItem[] = [
    {
      id: 201,
      author: { userId: 0, nickName: me, avatar: '' },
      summary:
        '整理了一份 Vue3 组合式 API 的常用写法对照表，把 setup 里最容易踩的几个坑都标出来了。',
      topic: '前端打卡',
      images: [],
      createTime: '3 天前',
      likeCount: 16,
      commentCount: 2
    },
    {
      id: 202,
      author: { userId: 0, nickName: me, avatar: '' },
      summary: '想问下大家平时怎么安排复习节奏？我学完一章隔几天就忘得差不多了。',
      topic: '求大佬解答',
      images: [],
      createTime: '1 周前',
      likeCount: 5,
      commentCount: 4
    }
  ]

  const rows = [...mine, ...preset]
  return body({ rows, total: rows.length })
}

function mockAddComment(raw: unknown): MockResponse {
  const content = str(asRecord(raw), 'content')
  if (!content) return error('评论内容不能为空')

  commentSeq += 1
  return body({
    data: {
      id: 9000 + commentSeq,
      // 模拟层拿不到真实登录态时用「我」兜底
      author: { userId: 0, nickName: currentUser ?? '我', avatar: '' },
      content,
      createTime: '刚刚',
      likeCount: 0
    }
  })
}

// ---------- 对外入口 ----------

/**
 * 命中模拟路由则返回响应，否则返回 null（调用方继续走真实请求）。
 */
export async function mockRequest(options: MockRequestOptions): Promise<MockResponse | null> {
  const path = options.url.split('?')[0]
  const method = options.method.toUpperCase()

  // 关掉模拟层时，只兜底后端还没实现的那些接口
  const pending = PENDING_ROUTES.some((prefix) => path.includes(prefix))
  if (options.useMock === false && !pending) return null

  // 模拟一点网络延迟，方便看清 loading 状态
  await delay(300)

  // 认证
  if (method === 'GET' && path.endsWith('/captchaImage')) return mockCaptcha()
  if (method === 'POST' && path.endsWith('/login')) return mockLogin(options.data)
  if (method === 'POST' && path.endsWith('/register')) return mockRegister(options.data)
  if (method === 'GET' && path.endsWith('/getInfo')) return mockGetInfo()

  // 内容
  if (method === 'GET' && path.endsWith('/content/banners')) return mockBanners()
  if (method === 'GET' && path.endsWith('/content/courses')) return mockCourses(options.data)
  if (method === 'GET' && path.endsWith('/content/search')) return mockSearch(options.data)
  if (method === 'GET' && path.endsWith('/content/hotSearch')) return mockHotSearch()
  if (method === 'GET' && path.endsWith('/content/detail')) return mockCourseDetail(options.data)

  // 学习记录
  if (method === 'GET' && path.endsWith('/learning/history')) return listResponse(demoHistory)
  if (method === 'GET' && path.endsWith('/learning/favorites')) return listResponse(demoFavorites)
  if (method === 'GET' && path.endsWith('/learning/shelf')) return listResponse(demoShelf)

  // 社区
  if (method === 'GET' && path.endsWith('/community/post/list')) return mockPostList(options.data)
  if (method === 'GET' && path.endsWith('/community/post/mine')) return mockMyPosts()
  if (method === 'POST' && path.endsWith('/community/post/create')) {
    return mockCreatePost(options.data)
  }
  if (method === 'GET' && path.endsWith('/community/post/detail'))
    return mockPostDetail(options.data)
  if (method === 'GET' && path.endsWith('/community/post/comments')) {
    return listResponse(demoComments)
  }
  if (method === 'POST' && path.endsWith('/community/post/comment')) {
    return mockAddComment(options.data)
  }
  if (method === 'POST' && path.endsWith('/community/post/like')) return body({})
  if (method === 'POST' && path.endsWith('/community/post/favorite')) return body({})

  return null
}
