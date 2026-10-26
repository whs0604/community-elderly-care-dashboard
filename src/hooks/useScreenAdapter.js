// ============================================================
// useScreenAdapter：大屏自适应 hook
// 以 1920x1080 为设计稿，按窗口等比缩放（transform: scale）
// ============================================================
import { onMounted, onBeforeUnmount, ref } from 'vue'

export function useScreenAdapter(designW = 1920, designH = 1080) {
  const scale = ref(1)

  const update = () => {
    const w = document.documentElement.clientWidth
    const h = document.documentElement.clientHeight
    // 取宽高缩放最小值，保证完整显示、不变形
    scale.value = Math.min(w / designW, h / designH)
  }

  onMounted(update)
  window.addEventListener('resize', update)
  onBeforeUnmount(() => window.removeEventListener('resize', update))

  return { scale, designW, designH }
}
