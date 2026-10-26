<script setup>
// 高频服务诉求 TOP12：水平条形排行图（替代 echarts-wordcloud，渲染稳定且能展示数值）
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { AXIS, TIP } from '@/utils/chartTheme'

const props = defineProps({
  // [{ name, value }]
  data: { type: Array, default: () => [] }
})

const option = computed(() => {
  // 取词频最高的 12 项，倒序排列（y 轴 inverse 后第一名在最上）
  const list = [...props.data].sort((a, b) => b.value - a.value).slice(0, 12)
  const max = Math.max(...list.map((d) => d.value), 1)
  return {
    tooltip: { ...TIP, trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 40, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: 'value', show: false, max: max * 1.1 },
    yAxis: {
      type: 'category',
      inverse: true,
      data: list.map((d) => d.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#cfe6ff', fontSize: 12 }
    },
    series: [
      {
        type: 'bar',
        barWidth: '55%',
        data: list.map((d) => d.value),
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          // 按词频从亮青渐变到灰蓝，突出高频诉求
          color: (p) => {
            const t = p.value / max
            return t > 0.7
              ? '#00d4ff'
              : t > 0.45
                ? '#4de3a5'
                : '#3d5a80'
          }
        },
        label: {
          show: true,
          position: 'right',
          color: '#8fa6c8',
          fontSize: 11,
          formatter: '{c} 次'
        }
      }
    ]
  }
})
</script>

<template>
  <BaseChart :option="option" />
</template>
