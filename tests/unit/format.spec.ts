import { describe, expect, it } from 'vitest'
import { formatAmount, formatDate, formatFileSize, maskPhone, padZero } from '@/utils/format'

describe('formatDate', () => {
  it('按默认模板格式化 Date 实例', () => {
    expect(formatDate(new Date(2024, 0, 2, 3, 4, 5))).toBe('2024-01-02 03:04:05')
  })

  it('兼容 iOS 解析不了的 "YYYY-MM-DD HH:mm:ss" 字符串', () => {
    expect(formatDate('2024-01-02 03:04:05', 'YYYY/MM/DD')).toBe('2024/01/02')
  })

  it('接受时间戳', () => {
    expect(formatDate(new Date(2024, 5, 7).getTime(), 'MM-DD')).toBe('06-07')
  })

  it('非法或空输入返回空串', () => {
    expect(formatDate('not-a-date')).toBe('')
    expect(formatDate('')).toBe('')
  })
})

describe('padZero', () => {
  it('按位数补零', () => {
    expect(padZero(7)).toBe('07')
    expect(padZero(7, 4)).toBe('0007')
  })

  it('保留负号', () => {
    expect(padZero(-7, 3)).toBe('-007')
  })

  it('超过位数时原样返回', () => {
    expect(padZero(12345)).toBe('12345')
  })
})

describe('maskPhone', () => {
  it('脱敏 11 位手机号', () => {
    expect(maskPhone('13812345678')).toBe('138****5678')
  })

  it('非 11 位数字原样返回', () => {
    expect(maskPhone('123')).toBe('123')
    expect(maskPhone('1381234567a')).toBe('1381234567a')
  })
})

describe('formatAmount', () => {
  it('整数部分加千分位', () => {
    expect(formatAmount(1234567.891)).toBe('1,234,567.89')
  })

  it('不会在小数位里误插逗号', () => {
    expect(formatAmount(1234.5678, 4)).toBe('1,234.5678')
  })

  it('负数保留符号', () => {
    expect(formatAmount(-1234.5)).toBe('-1,234.50')
  })

  it('非法值归零', () => {
    expect(formatAmount('abc')).toBe('0.00')
  })
})

describe('formatFileSize', () => {
  it('按 1024 进制换算', () => {
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(1536)).toBe('1.5 KB')
    expect(formatFileSize(1024 * 1024 * 3)).toBe('3 MB')
  })

  it('非法值归零', () => {
    expect(formatFileSize(Number.NaN)).toBe('0 B')
  })
})
