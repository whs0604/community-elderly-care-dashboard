<script setup>
// 分类占比饼图：支持 饼图 / 环形图 / 玫瑰图
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { TIP, LEGEND, CHART_COLOR } from '@/utils/chartTheme'

const props = defineProps({
  data: { type: Array, default: () => [] }, // [{name, value}]
  type: { type: String, default: 'pie' },   // pie | ring | rose
  name: { type: String, default: '' }
})
const emit = defineEmits(['chartClick'])

const option = computed(() => ({
  tooltip: { ...TIP, trigger: 'item', formatter: '{b}：{c}（{d}%）' },
  legend: { ...LEGEND, bottom: 0 },
  color: CHART_COLOR,
  series: [
    {
      name: props.name,
      type: 'pie',
      radius: props.type === 'ring' ? ['42%', '64%'] : props.type === 'rose' ? ['22%', '66%'] : '62%',
      roseType: props.type === 'rose' ? 'radius' : undefined,
      center: ['50%', '46%'],
      label: { color: '#cfe6ff', fontSize: 11, formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: 'rgba(255,255,255,.3)' } },
      itemStyle: { borderColor: '#0a1122', borderWidth: 2 },
      data: props.data,
      emphasis: {
        itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,212,255,.5)' }
      }
    }
  ]
}))
</script>

<template>
  <BaseChart :option="option" @chart-click="(p) => emit('chartClick', p)" />
</template>
