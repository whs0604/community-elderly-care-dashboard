// ECharts 深色主题统一配置，所有图表共用，保证大屏风格一致

export const CHART_COLOR = [
  '#00d4ff',
  '#4de3a5',
  '#ffd166',
  '#ff7a6b',
  '#9c6ade',
  '#ff9d4d',
  '#4d8cff',
  '#e06666'
]

// 坐标轴统一样式
export const AXIS = {
  axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
  axisTick: { show: false },
  axisLabel: { color: '#8fa6c8', fontSize: 11 },
  splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.06)' } }
}

// 提示框统一样式
export const TIP = {
  backgroundColor: 'rgba(8, 20, 40, 0.92)',
  borderColor: 'rgba(0, 212, 255, 0.4)',
  borderWidth: 1,
  textStyle: { color: '#e6f4ff', fontSize: 12 }
}

// 图例统一样式
export const LEGEND = {
  textStyle: { color: '#cfe6ff', fontSize: 11 },
  icon: 'roundRect',
  itemWidth: 10,
  itemHeight: 6
}
