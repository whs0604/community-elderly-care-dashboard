<script setup>
// ============================================================
// BaseChart：ECharts 统一封装组件
// 所有图表复用它，集中管理 init / setOption / resize / 销毁
// ============================================================
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  option: { type: Object, required: true }
})
const emit = defineEmits(['chartClick'])

const el = ref(null)
let chart = null
let observer = null

function render(opt) {
  if (!chart) return
  // notMerge 保证每次数据更新整体重绘，避免旧图形残留
  // 默认关闭动画：大屏首帧直接出图；option 里显式声明 animation 的图表（如词云）不受影响
  const finalOpt = opt.animation === undefined ? { ...opt, animation: false } : opt
  chart.setOption(finalOpt, { notMerge: true })
}

onMounted(() => {
  chart = echarts.init(el.value)
  render(props.option)

  observer = new ResizeObserver(() => chart && chart.resize())
  observer.observe(el.value)

  chart.on('click', (params) => emit('chartClick', params))
})

// 数据变化（深比较）时自动更新图表
watch(() => props.option, (opt) => render(opt), { deep: true })

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  if (chart) chart.dispose()
  chart = null
})
</script>

<template>
  <div ref="el" style="width: 100%; height: 100%"></div>
</template>
