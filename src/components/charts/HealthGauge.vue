<script setup>
// 实时体征仪表盘：支持多条 gauge 并列（如收缩压+舒张压）
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  // [{ name, value, min, max, unit, color }]
  data: { type: Array, default: () => [] }
})

const option = computed(() => {
  const n = Math.max(props.data.length, 1)
  return {
    series: props.data.map((d, i) => ({
      type: 'gauge',
      // n 条时水平均分居中
      center: [(((i * 2 + 1) / (n * 2)) * 100).toFixed(1) + '%', '58%'],
      radius: '92%',
      startAngle: 210,
      endAngle: -30,
      min: d.min,
      max: d.max,
      // 进度条：当前值到最大值着色
      progress: { show: true, width: 12, itemStyle: { color: d.color } },
      axisLine: {
        lineStyle: { width: 12, color: [[1, 'rgba(255,255,255,.08)']] }
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false },
      title: { show: true, offsetCenter: [0, '30%'], color: '#8fa6c8', fontSize: 13 },
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '-4%'],
        formatter: '{value}' + d.unit,
        color: d.color,
        fontSize: 18,
        fontWeight: 700
      },
      data: [{ value: d.value, name: d.name }]
    }))
  }
})
</script>

<template>
  <BaseChart :option="option" />
</template>
