/**
 * 纯函数格式化工具。
 * 不依赖任何 uni API，因此可以脱离运行环境直接做单元测试。
 */

export function padZero(value: number, length = 2): string {
  const str = String(Math.trunc(value))
  const negative = str.startsWith('-')
  const digits = negative ? str.slice(1) : str
  return `${negative ? '-' : ''}${digits.padStart(length, '0')}`
}

/**
 * 格式化日期。
 *
 * `new Date('2024-01-02 03:04:05')` 在部分 iOS / Safari 上会得到 Invalid Date，
 * 这里统一把 `-` 换成 `/` 再解析。
 */
export function formatDate(input: Date | string | number, pattern = 'YYYY-MM-DD HH:mm:ss'): string {
  if (input === null || input === undefined || input === '') return ''

  const date =
    input instanceof Date
      ? input
      : new Date(typeof input === 'string' ? input.replace(/-/g, '/') : input)

  if (Number.isNaN(date.getTime())) return ''

  const tokens: Record<string, number> = {
    YYYY: date.getFullYear(),
    MM: date.getMonth() + 1,
    DD: date.getDate(),
    HH: date.getHours(),
    mm: date.getMinutes(),
    ss: date.getSeconds()
  }

  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (token) =>
    padZero(tokens[token], token === 'YYYY' ? 4 : 2)
  )
}

/** 手机号脱敏：13812345678 -> 138****5678 */
export function maskPhone(phone: string): string {
  const value = String(phone ?? '').trim()
  if (!/^\d{11}$/.test(value)) return value
  return `${value.slice(0, 3)}****${value.slice(7)}`
}

/** 金额千分位格式化，先把小数位截断再加分隔符，避免误伤小数部分 */
export function formatAmount(value: number | string, digits = 2): string {
  const num = Number(value)
  const fixed = (Number.isFinite(num) ? num : 0).toFixed(digits)
  const [intPart, decimalPart] = fixed.split('.')
  const withSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decimalPart ? `${withSeparator}.${decimalPart}` : withSeparator
}

/** 字节数格式化：1536 -> 1.5 KB */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const size = bytes / Math.pow(1024, index)

  return index === 0
    ? `${size} ${units[index]}`
    : `${Number(size.toFixed(decimals))} ${units[index]}`
}
