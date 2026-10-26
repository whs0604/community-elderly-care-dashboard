// ============================================================
// usePolling：定时轮询 hook
// 组件卸载时自动清理定时器，避免路由切换后继续请求
// ============================================================
import { onBeforeUnmount } from 'vue'

/**
 * @param {Function} fn 轮询要执行的函数
 * @param {number} interval 间隔毫秒
 */
export function usePolling(fn, interval = 30000) {
  let timer = null

  const start = () => {
    stop()
    timer = setInterval(fn, interval)
  }

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onBeforeUnmount(stop)

  return { start, stop }
}
