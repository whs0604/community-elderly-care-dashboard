// ============================================================
// useEcharts：图表生命周期 hook
// 负责 init / setOption / resize / 销毁，配合 BaseChart 使用
// ============================================================
import { onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

/**
 * @param {import('vue').Ref} elRef 图表容器 ref
 * @param {() => object} optionGetter 返回 option 的函数
 */
export function useEcharts(elRef, optionGetter) {
  let chart = null
  let observer = null

  onMounted(() => {
    chart = echarts.init(elRef.value)
    chart.setOption(optionGetter())

    // 容器尺寸变化时自适应（ResizeObserver 比 window.resize 更精准）
    observer = new ResizeObserver(() => chart && chart.resize())
    observer.observe(elRef.value)
  })

  const update = (option) => {
    if (chart) chart.setOption(option, { notMerge: true })
  }

  const on = (event, handler) => {
    if (chart) chart.on(event, handler)
  }

  onBeforeUnmount(() => {
    if (observer) observer.disconnect()
    if (chart) chart.dispose() // 防止内存泄漏
    chart = null
  })

  return { update, on }
}
