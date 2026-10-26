// 通用格式化工具

/**
 * 数字补零
 * @param {number} n
 */
export function padZero(n) {
  return String(n).padStart(2, '0')
}

/**
 * 千分位格式化
 * @param {number} n
 */
export function toThousands(n) {
  return Number(n || 0).toLocaleString('zh-CN')
}

/**
 * 数值保留小数
 * @param {number} n
 * @param {number} [dec]
 */
export function fixed(n, dec = 1) {
  return +Number(n).toFixed(dec)
}
