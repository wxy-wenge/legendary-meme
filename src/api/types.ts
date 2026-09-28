/** 与若依后端约定的领域模型，按业务模块继续往下加即可 */

// ---------- 认证 ----------

/** 登录参数（若依 POST /login：用户名 + 密码 + 验证码 + uuid） */
export interface LoginParams {
  username: string
  password: string
  /** 验证码（后端开启验证码时必填） */
  code?: string
  /** 验证码对应的 uuid（来自 GET /captchaImage） */
  uuid?: string
}

/**
 * 注册参数（若依 POST /register）。
 * 后端 RegisterBody 只继承 LoginBody，没有 confirmPassword 字段，
 * 所以 confirmPassword 仅用于前端校验，后端会忽略它。
 */
export interface RegisterParams extends LoginParams {
  confirmPassword: string
}

/** 验证码返回（GET /captchaImage） */
export interface CaptchaResult {
  /** 是否开启验证码；false 时前端隐藏验证码输入框 */
  captchaEnabled: boolean
  uuid?: string
  /**
   * 验证码图片。后端返回的是**裸 base64**（没有 data URI 前缀），
   * 已在 src/api/modules/user.ts 里补成完整的 `data:image/jpeg;base64,xxx`。
   */
  img?: string
  /**
   * 仅前端模拟层返回（见 src/api/mock.ts）：模拟模式下用于显示的验证码文本，
   * 例如数学题 `3+5=?`。真实后端不会返回这个字段。
   */
  mockText?: string
}

/** 登录返回（POST /login，token 在响应顶层，不在 data 里） */
export interface LoginResult {
  token: string
}

/** 用户信息（GET /getInfo 返回顶层的 user 字段） */
export interface UserInfo {
  userId: number
  userName: string
  nickName: string
  avatar?: string
  phonenumber?: string
  email?: string
  dept?: { deptId: number; deptName: string }
  [key: string]: unknown
}

/** GET /getInfo 返回（user / roles / permissions 均在响应顶层） */
export interface UserInfoResult {
  user: UserInfo
  roles: string[]
  permissions: string[]
}

// ---------- 业务：内容（课程 / 视频 / 文章） ----------

/** 内容形态 */
export type ContentType = 'article' | 'video'

/** 列表和卡片用的一条课程 */
export interface CourseItem {
  id: number
  title: string
  type: ContentType
  /** 分类，用于首页标签筛选和搜索匹配 */
  category: string
  /** 封面占位用的 emoji */
  emoji: string
  /** 封面渐变，形如 linear-gradient(135deg, #818CF8 0%, #A78BFA 100%) */
  cover: string
  /** 满星数量 1~5 */
  stars: number
  /** 评分，形如 4.9 */
  score: string
  /** 学习人数，形如 12.3k */
  learners: string
}

/** 首页轮播位 */
export interface BannerItem {
  id: number
  title: string
  sub: string
  /** 背景渐变 */
  bg: string
}

/** 目录里的一节课 */
export interface CourseLesson {
  title: string
  time: string
}

/** 目录里的一章 */
export interface CourseChapter {
  title: string
  duration: string
  lessons: CourseLesson[]
}

/** 评分分布的一行 */
export interface ScoreDistRow {
  star: number
  percent: number
}

/** 一条课程评价 */
export interface CourseReview {
  name: string
  stars: number
  time: string
  content: string
}

/** 课程详情（GET /content/detail） */
export interface CourseDetail extends CourseItem {
  /** 讲师 / 作者 */
  author: string
  /** 副标题，形如「视频课 · 共 3 章」 */
  subtitle: string
  /** 课程介绍 */
  intro: string
  /** 你将学到 */
  outcomes: string[]
  chapters: CourseChapter[]
  distribution: ScoreDistRow[]
  reviews: CourseReview[]
}

/** 课程列表查询参数 */
export interface CourseQuery {
  /** 分类；空或「推荐」表示不筛 */
  category?: string
  pageNum?: number
  pageSize?: number
}

// ---------- 业务：社区（帖子 / 评论） ----------

/** 帖子作者 */
export interface PostAuthor {
  userId: number
  nickName: string
  avatar?: string
}

/** 帖子里的图片 / 视频 */
export interface PostMedia {
  type: 'image' | 'video'
  /** 资源地址 */
  url: string
  /** 视频封面 */
  cover?: string
}

/** 一条评论。replies 是楼中楼，只支持一层 */
export interface PostComment {
  id: number
  author: PostAuthor
  content: string
  createTime: string
  likeCount: number
  replies?: PostComment[]
}

/** 帖子详情（GET /community/post/detail） */
export interface PostDetail {
  id: number
  author: PostAuthor
  content: string
  /** 话题标签，不带 # */
  topic?: string
  media: PostMedia[]
  createTime: string
  likeCount: number
  commentCount: number
  /** 当前用户是否已点赞 */
  liked: boolean
  /** 当前用户是否已收藏 */
  favorited: boolean
}

/** 帖子列表里的一条（GET /community/post/list） */
export interface PostItem {
  id: number
  author: PostAuthor
  /** 正文摘要，列表里最多显示两行 */
  summary: string
  /** 话题标签，不带 # */
  topic?: string
  /** 配图地址，列表里最多显示三张 */
  images: string[]
  createTime: string
  likeCount: number
  commentCount: number
}

/** 发帖参数（POST /community/post/create） */
export interface PostCreateParams {
  content: string
  /** 话题标签，不带 #，可为空 */
  topic?: string
  /** 图片地址。真实流程要先把本地文件传到后端拿到 URL 再传进来 */
  images: string[]
  /** 关联的课程 id，可为空 */
  relatedId?: number
}

// ---------- 业务：学习记录（「我的」页） ----------

/** 观看 / 阅读历史的一条 */
export interface LearnHistoryItem {
  id: number
  /** 0 视频 / 1 书籍，对应页面上二级筛选的下标 */
  kind: 0 | 1
  title: string
  /** 是否已看完；已看完不显示进度 */
  done: boolean
  /** 未看完时的进度文案，已看完为空字符串 */
  progress: string
}

/** 收藏 / 书架用的简单条目 */
export interface CoverItem {
  id: number
  title: string
}

// ---------- 通用 ----------

/** 若依列表接口统一返回：rows（当前页数据）+ total（总数），均在响应顶层 */
export interface TableResult<T> {
  rows: T[]
  total: number
}

// ---------- 业务：学习用户 learninguser ----------

/**
 * 学习用户实体。
 * 字段需与后端实体类保持一致 —— 目前后端还没有对应模块，字段待定。
 */
export interface LearningUser {
  id: number
  // TODO: 后端建好实体后按实际字段补充
  [key: string]: unknown
}
