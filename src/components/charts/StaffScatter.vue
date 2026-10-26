<script setup>
// 服务人员片区分布：散点气泡图（气泡大小=人员总数，颜色=是否满勤）
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { AXIS, TIP } from '@/utils/chartTheme'

const props = defineProps({
  // [{ name, value: [x, y, total], onDuty, total }]
  data: { type: Array, default: () => [] }
})

const option = computed(() => ({
  tooltip: {
    ...TIP,
    formatter: (p) => p.data.name + '<br/>在岗 ' + p.data.onDuty + ' / ' + p.data.total + ' 人'
  },
  grid: { left: 44, right: 24, top: 26, bottom: 34 },
  xAxis: { type: 'value', min: 0, max: 100, name: '服务网格 →', ...AXIS },
  yAxis: { type: 'value', min: 0, max: 100, name: '↑', ...AXIS },
  series: [
    {
      type: 'scatter',
      data: props.data,
      symbolSize: (val) => Math.max(10, Math.min(36, val[2] * 0.9)),
      itemStyle: {
        color: (p) => (p.data.onDuty === p.data.total ? '#4de3a5' : '#ffd166'),
        opacity: 0.88,
        borderColor: '#0a1122',
        borderWidth: 1
      },
      label: {
        show: true,
        formatter: (p) => p.data.name,
        position: 'top',
        color: '#8fa6c8',
        fontSize: 11
      },
      emphasis: {
        itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,212,255,.6)' }
      }
    }
  ]
}))
</script>

<template>
  <BaseChart :option="option" />
</template>
