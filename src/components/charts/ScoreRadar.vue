<script setup>
// 健康综合评分雷达图：多维度健康评估
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { TIP } from '@/utils/chartTheme'

const props = defineProps({
  indicators: { type: Array, default: () => [] }, // [{name, max}]
  values: { type: Array, default: () => [] },
  name: { type: String, default: '健康评分' }
})

const option = computed(() => ({
  tooltip: { ...TIP, trigger: 'item' },
  radar: {
    indicator: props.indicators,
    radius: '64%',
    center: ['50%', '54%'],
    splitArea: {
      areaStyle: { color: ['rgba(0,212,255,.03)', 'rgba(0,212,255,.06)'] }
    },
    axisLine: { lineStyle: { color: 'rgba(0,212,255,.25)' } },
    splitLine: { lineStyle: { color: 'rgba(0,212,255,.2)' } },
    axisName: { color: '#cfe6ff', fontSize: 11 }
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: props.values,
          name: props.name,
          areaStyle: { color: 'rgba(0,212,255,.2)' },
          lineStyle: { color: '#00d4ff', width: 2 },
          itemStyle: { color: '#00d4ff' }
        }
      ]
    }
  ]
}))
</script>

<template>
  <BaseChart :option="option" />
</template>
