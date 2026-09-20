/** 与后端约定的领域模型，按业务模块继续往下加即可 */

export interface LoginParams {
  username: string
  password: string
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  phone?: string
  email?: string
  roles: string[]
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}

export interface Banner {
  id: number
  title: string
  image: string
  link: string
}

export interface Article {
  id: number
  title: string
  summary: string
  createdAt: string
}
