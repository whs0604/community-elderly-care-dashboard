<script setup>
// 健康指标趋势：折线图 + 上下限阈值标记线
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { AXIS, TIP } from '@/utils/chartTheme'

const props = defineProps({
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  name: { type: String, default: '数值' },
  unit: { type: String, default: '' },
  threshold: { type: Array, default: () => [null, null] }, // [下限, 上限]
  color: { type: String, default: '#00d4ff' }
})

const option = computed(() => {
  // 根据阈值生成标记线（绿色=下限，红色=上限）
  const marks = []
  if (props.threshold[0] != null) {
    marks.push({
      yAxis: props.threshold[0],
      lineStyle: { color: '#4de3a5', type: 'dashed' },
      label: { formatter: '下限 ' + props.threshold[0], color: '#4de3a5', fontSize: 10 }
    })
  }
  if (props.threshold[1] != null) {
    marks.push({
      yAxis: props.threshold[1],
      lineStyle: { color: '#ff7a6b', type: 'dashed' },
      label: { formatter: '上限 ' + props.threshold[1], color: '#ff7a6b', fontSize: 10 }
    })
  }

  return {
    tooltip: { ...TIP, trigger: 'axis', formatter: (p) => p[0].name + '<br/>' + props.name + '：' + p[0].value + ' ' + props.unit },
    grid: { left: 42, right: 20, top: 30, bottom: 26 },
    xAxis: { type: 'category', data: props.labels, boundaryGap: false, ...AXIS },
    yAxis: { type: 'value', ...AXIS },
    series: [
      {
        name: props.name,
        type: 'line',
        smooth: true,
        data: props.values,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: 2, color: props.color },
        itemStyle: { color: props.color },
        // 渐变面积填充
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: props.color + '33' },
              { offset: 1, color: props.color + '00' }
            ]
          }
        },
        markLine: { symbol: 'none', data: marks }
      }
    ]
  }
})
</script>

<template>
  <BaseChart :option="option" />
</template>
