<script setup>
// ============================================================
// Dashboard：大屏主页面
// 顶部标题栏 + 三列主体（健康 / 事件需求 / 人员响应）+ 底部词云播报
// 数据来自 Mock（30s 轮询），支持时间范围切换与图表点击联动
// ============================================================
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'

import ScreenHeader from '@/components/ScreenHeader.vue'
import PanelCard from '@/components/PanelCard.vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import TrendLine from '@/components/charts/TrendLine.vue'
import CategoryPie from '@/components/charts/CategoryPie.vue'
import HealthGauge from '@/components/charts/HealthGauge.vue'
import ScoreRadar from '@/components/charts/ScoreRadar.vue'
import StaffScatter from '@/components/charts/StaffScatter.vue'
import HotWordCloud from '@/components/charts/HotWordCloud.vue'

import { useScreenAdapter } from '@/hooks/useScreenAdapter'
import { usePolling } from '@/hooks/usePolling'

import { getHealthOverview, getHealthTrend, getHealthLatest } from '@/api/modules/health'
import { getDemandCategory, getDemandTrend, getHotwords } from '@/api/modules/demand'
import { getEventOverview, getEventTrend, getEventType, getRecentEvents } from '@/api/modules/event'
import { getStaffDistribution, getStaffStatus } from '@/api/modules/staff'
import { getResponseAvg, getResponseDistribution } from '@/api/modules/response'

import { AXIS, TIP, LEGEND, CHART_COLOR } from '@/utils/chartTheme'

// ---------- 大屏自适应 ----------
const { scale } = useScreenAdapter(1920, 1080)

// ---------- 时间范围 ----------
const range = ref('week') // today | week | month
const ranges = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' }
]

// ---------- 健康指标切换 ----------
const metric = ref('hr')
const metricList = [
  { key: 'hr', label: '心率' },
  { key: 'bp', label: '血压' },
  { key: 'bs', label: '血糖' }
]
const METRICS = {
  hr: { label: '心率', unit: 'bpm', threshold: [60, 100], color: '#ff7a6b' },
  bp: { label: '收缩压', unit: 'mmHg', threshold: [90, 140], color: '#00d4ff' },
  bs: { label: '血糖', unit: 'mmol/L', threshold: [3.9, 6.1], color: '#4de3a5' }
}

// ---------- 数据状态 ----------
const healthOverview = ref({ total: 0, normal: 0, warn: 0, abnormal: 0 })
const healthTrend = ref({ labels: [], values: [], average: 0, abnormal: 0 })
const latest = ref({
  hr: { name: '心率', value: 72, min: 40, max: 140, unit: 'bpm', color: '#ff7a6b' },
  sbp: { name: '收缩压', value: 128, min: 80, max: 180, unit: 'mmHg', color: '#00d4ff' },
  dbp: { name: '舒张压', value: 82, min: 50, max: 110, unit: 'mmHg', color: '#4de3a5' }
})
const radarData = ref({
  indicators: [
    { name: '血压', max: 100 },
    { name: '心率', max: 100 },
    { name: '血糖', max: 100 },
    { name: '血氧', max: 100 },
    { name: '睡眠', max: 100 },
    { name: '活动量', max: 100 }
  ],
  values: [82, 78, 88, 95, 70, 65]
})

const demandCategory = ref([
  { name: '助餐', value: 60 },
  { name: '助浴', value: 50 },
  { name: '助医', value: 45 },
  { name: '助洁', value: 40 },
  { name: '陪护', value: 55 },
  { name: '康复', value: 35 },
  { name: '文娱', value: 30 }
])
const demandTrend = ref({ labels: ['05-20','05-21','05-22','05-23','05-24','05-25','05-26'], values: [40, 55, 48, 62, 58, 66, 60] })
const hotwords = ref([
  { name: '助餐服务', value: 86 }, { name: '上门理发', value: 72 }, { name: '陪诊就医', value: 68 },
  { name: '血压复查', value: 61 }, { name: '康复训练', value: 55 }, { name: '代购药品', value: 50 },
  { name: '家政保洁', value: 46 }, { name: '心理疏导', value: 42 }, { name: '助浴服务', value: 38 },
  { name: '送餐上门', value: 36 }, { name: '防跌倒指导', value: 32 }, { name: '用药提醒', value: 30 }
])

const eventOverview = ref({ todayTotal: 0, processing: 0, critical: 0, resolved: 0 })
const eventTrend = ref({ labels: ['05-20','05-21','05-22','05-23','05-24','05-25','05-26'], values: [10, 12, 9, 15, 11, 13, 12] })
const eventType = ref([
  { name: '跌倒', value: 12 }, { name: '突发疾病', value: 10 }, { name: '走失', value: 6 },
  { name: '火警', value: 4 }, { name: '煤气', value: 5 }, { name: '其他', value: 14 }
])
const recentEvents = ref([])

const staffDistribution = ref([
  { zone: '东片区', name: '东片区', value: [18, 62, 30], total: 30, onDuty: 22 },
  { zone: '南片区', name: '南片区', value: [38, 40, 26], total: 26, onDuty: 18 },
  { zone: '西片区', name: '西片区', value: [55, 68, 34], total: 34, onDuty: 25 },
  { zone: '北片区', name: '北片区', value: [78, 36, 22], total: 22, onDuty: 15 },
  { zone: '中片区', name: '中片区', value: [90, 60, 28], total: 28, onDuty: 20 }
])
const staffStatus = ref([
  { name: '护理员', onDuty: 20 }, { name: '护士', onDuty: 12 }, { name: '社工', onDuty: 10 }, { name: '志愿者', onDuty: 16 }
])
const responseAvg = ref([
  { zone: '东片区', avg: 12 }, { zone: '南片区', avg: 15 }, { zone: '西片区', avg: 18 }, { zone: '北片区', avg: 14 }, { zone: '中片区', avg: 11 }
])
const responseDistribution = ref([
  { name: '<5分', value: 6 }, { name: '5-10分', value: 18 }, { name: '10-15分', value: 30 },
  { name: '15-20分', value: 22 }, { name: '20-30分', value: 10 }, { name: '>30分', value: 4 }
])

// 响应面板视图：按片区均值 / 按时长区间分布
const respMode = ref('zone')

// 交互状态
const focus = ref('')
const updateTime = ref('')

// ---------- 派生统计 ----------
const avgResp = computed(() => {
  const list = responseAvg.value
  if (!list.length) return '--'
  return (list.reduce((s, z) => s + z.avg, 0) / list.length).toFixed(1)
})

const stats = computed(() => [
  { label: '今日事件', value: eventOverview.value.todayTotal || 0, unit: '起', color: '#ff7a6b' },
  { label: '处理中', value: eventOverview.value.processing || 0, unit: '起', color: '#ffd166' },
  { label: '危急事件', value: eventOverview.value.critical || 0, unit: '起', color: '#e06666' },
  { label: '平均响应', value: avgResp.value, unit: 'min', color: '#4de3a5' }
])

// 告警条件：健康异常人数>=10 或 危急事件>=1
const alarm = computed(
  () => (healthOverview.value.abnormal || 0) >= 10 || (eventOverview.value.critical || 0) >= 1
)

// ---------- 图表 option ----------
const eventTrendOption = computed(() => ({
  tooltip: { ...TIP, trigger: 'axis' },
  grid: { left: 40, right: 16, top: 28, bottom: 26 },
  xAxis: {
    type: 'category',
    data: eventTrend.value.labels,
    ...AXIS,
    axisLabel: { ...AXIS.axisLabel, interval: eventTrend.value.labels.length > 14 ? 3 : 0 }
  },
  yAxis: { type: 'value', ...AXIS },
  series: [
    {
      name: '事件数',
      type: range.value === 'today' ? 'bar' : 'line',
      smooth: true,
      data: eventTrend.value.values,
      barWidth: '55%',
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#ffd166' },
            { offset: 1, color: 'rgba(255,209,102,.15)' }
          ]
        },
        borderRadius: [3, 3, 0, 0]
      },
      lineStyle: { color: '#ffd166', width: 2 },
      areaStyle: range.value === 'today' ? undefined : { color: 'rgba(255,209,102,.12)' },
      markLine: {
        symbol: 'none',
        data: [
          {
            yAxis: 12,
            lineStyle: { color: '#ff7a6b', type: 'dashed' },
            label: { formatter: '警戒线 12', color: '#ff7a6b', fontSize: 10 }
          }
        ]
      }
    }
  ]
}))

const demandTrendOption = computed(() => ({
  tooltip: { ...TIP, trigger: 'axis' },
  grid: { left: 40, right: 16, top: 26, bottom: 26 },
  xAxis: {
    type: 'category',
    data: demandTrend.value.labels,
    ...AXIS,
    axisLabel: { ...AXIS.axisLabel, interval: demandTrend.value.labels.length > 14 ? 3 : 0 }
  },
  yAxis: { type: 'value', ...AXIS },
  series: [
    {
      name: '需求件数',
      type: 'bar',
      barWidth: '50%',
      data: demandTrend.value.values,
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#9c6ade' },
            { offset: 1, color: 'rgba(156,106,222,.15)' }
          ]
        },
        borderRadius: [3, 3, 0, 0]
      }
    }
  ]
}))

const responseAvgOption = computed(() => {
  // 时长区间分布视图
  if (respMode.value === 'bucket') {
    const list = responseDistribution.value
    return {
      tooltip: { ...TIP, trigger: 'axis', formatter: (p) => p[0].name + '<br/>' + p[0].value + ' 起' },
      grid: { left: 40, right: 16, top: 26, bottom: 26 },
      xAxis: { type: 'category', data: list.map((d) => d.name), ...AXIS },
      yAxis: { type: 'value', ...AXIS },
      series: [
        {
          name: '事件数',
          type: 'bar',
          barWidth: '52%',
          data: list.map((d) => d.value),
          itemStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#ff9d4d' },
                { offset: 1, color: 'rgba(255,157,77,.15)' }
              ]
            },
            borderRadius: [3, 3, 0, 0]
          }
        }
      ]
    }
  }
  // 按片区平均响应视图（含目标线）
  return {
    tooltip: { ...TIP, trigger: 'axis', formatter: (p) => p[0].name + '<br/>平均 ' + p[0].value + ' 分钟' },
    grid: { left: 42, right: 16, top: 26, bottom: 26 },
    xAxis: { type: 'category', data: responseAvg.value.map((z) => z.zone), ...AXIS },
    yAxis: { type: 'value', ...AXIS },
    series: [
      {
        name: '平均响应',
        type: 'bar',
        barWidth: '45%',
        data: responseAvg.value.map((z) => ({
          value: z.avg,
          itemStyle: {
            color: z.avg > 15 ? '#ff7a6b' : '#4de3a5',
            borderRadius: [3, 3, 0, 0]
          }
        })),
        markLine: {
          symbol: 'none',
          data: [
            {
              yAxis: 15,
              lineStyle: { color: '#00d4ff', type: 'dashed' },
              label: { formatter: '目标 15 分钟', color: '#00d4ff', fontSize: 10 }
            }
          ]
        }
      }
    ]
  }
})

const staffStatusOption = computed(() => ({
  tooltip: { ...TIP, trigger: 'item', formatter: '{b}：在岗 {c} 人（{d}%）' },
  legend: { ...LEGEND, bottom: 0 },
  color: CHART_COLOR,
  series: [
    {
      type: 'pie',
      radius: ['38%', '62%'],
      center: ['50%', '44%'],
      label: { show: false },
      itemStyle: { borderColor: '#0a1122', borderWidth: 2 },
      data: staffStatus.value.map((s) => ({ name: s.name, value: s.onDuty }))
    }
  ]
}))

// 播报列表：复制两份实现无缝滚动
const marqueeList = computed(() => [...recentEvents.value, ...recentEvents.value])

// ---------- 数据加载 ----------
const loadHealthTrend = async () => {
  healthTrend.value = await getHealthTrend({ type: metric.value, range: range.value })
}

const loadAll = async () => {
  // 用 allSettled：单个接口失败不影响其它数据更新，避免整页被清空
  const results = await Promise.allSettled([
    getHealthOverview(),
    getHealthLatest(),
    getDemandCategory(),
    getDemandTrend({ range: range.value }),
    getEventOverview(),
    getEventTrend({ range: range.value }),
    getEventType(),
    getStaffDistribution(),
    getStaffStatus(),
    getResponseAvg(),
    getResponseDistribution(),
    getHotwords(),
    getRecentEvents()
  ])
  const [ov, lat, dCat, dTrend, eOv, eTrend, eType, sDist, sStatus, rAvg, rDist, words, recent] =
    results.map((r) => (r.status === 'fulfilled' ? r.value : null))

  if (ov) healthOverview.value = ov
  if (lat) latest.value = lat
  if (dCat) demandCategory.value = dCat
  if (dTrend) demandTrend.value = dTrend
  if (eOv) eventOverview.value = eOv
  if (eTrend) eventTrend.value = eTrend
  if (eType) eventType.value = eType
  if (sDist) staffDistribution.value = sDist
  if (sStatus) staffStatus.value = sStatus
  if (rAvg) responseAvg.value = rAvg
  if (rDist) responseDistribution.value = rDist
  if (words) hotwords.value = words
  if (recent) recentEvents.value = recent
  updateTime.value = dayjs().format('HH:mm:ss')
}

// 雷达评分小幅漂移，让页面持续“有变化”
const driftRadar = () => {
  radarData.value.values = radarData.value.values.map((v) =>
    Math.min(100, Math.max(40, v + Math.round(Math.random() * 6 - 3)))
  )
}

// ---------- 交互 ----------
const switchRange = async (key) => {
  range.value = key
  await Promise.all([loadAll(), loadHealthTrend()])
}

const switchMetric = async (key) => {
  metric.value = key
  await loadHealthTrend()
}

const onEventTrendClick = (p) => {
  focus.value = p.name + ' 发生 ' + p.value + ' 起事件'
}

const onEventTypeClick = (p) => {
  focus.value = '事件类型 ' + p.name + ' · ' + p.value + ' 起'
}

const onDemandClick = (p) => {
  focus.value = p.name + ' 服务需求 · ' + p.value + ' 件'
}

// ---------- 轮询刷新 ----------
const polling = usePolling(async () => {
  await Promise.all([loadAll(), loadHealthTrend()])
  driftRadar()
}, 30000)

onMounted(async () => {
  await Promise.all([loadAll(), loadHealthTrend()])
  polling.start()
})
</script>

<template>
  <div class="screen-wrap">
    <div class="screen" :style="{ transform: 'scale(' + scale + ')' }">
      <!-- 顶部标题栏 -->
      <ScreenHeader :alarm="alarm" :focus="focus" :update-time="updateTime">
        <template #tabs>
          <div class="range-tabs">
            <button
              v-for="r in ranges"
              :key="r.key"
              class="range-tab"
              :class="{ active: range === r.key }"
              @click="switchRange(r.key)"
            >
              {{ r.label }}
            </button>
          </div>
        </template>
      </ScreenHeader>

      <!-- 主体三列 -->
      <main class="main-grid">
        <!-- ===== 左列：健康监测 ===== -->
        <div class="col">
          <PanelCard title="健康指标趋势" accent="#ff7a6b" class="h-280">
            <template #extra>
              <div class="chart-tabs">
                <button
                  v-for="m in metricList"
                  :key="m.key"
                  class="mini-tab"
                  :class="{ active: metric === m.key }"
                  @click="switchMetric(m.key)"
                >
                  {{ m.label }}
                </button>
              </div>
            </template>
            <TrendLine
              :labels="healthTrend.labels"
              :values="healthTrend.values"
              :name="METRICS[metric].label"
              :unit="METRICS[metric].unit"
              :threshold="METRICS[metric].threshold"
              :color="METRICS[metric].color"
            />
          </PanelCard>

          <PanelCard title="实时生命体征" class="h-190">
            <div class="gauge-row">
              <HealthGauge :data="[latest.hr]" class="gauge-item" />
              <HealthGauge :data="[latest.sbp, latest.dbp]" class="gauge-item wide" />
            </div>
          </PanelCard>

          <PanelCard title="健康综合评分" class="flex-1">
            <ScoreRadar :indicators="radarData.indicators" :values="radarData.values" />
          </PanelCard>
        </div>

        <!-- ===== 中列：事件与需求 ===== -->
        <div class="col">
          <div class="stats-row h-96">
            <div v-for="s in stats" :key="s.label" class="stat-card" :style="{ '--c': s.color }">
              <div class="stat-label">{{ s.label }}</div>
              <div class="stat-value">{{ s.value }}<small>{{ s.unit }}</small></div>
            </div>
          </div>

          <PanelCard title="紧急事件趋势" accent="#ffd166" class="h-300">
            <BaseChart :option="eventTrendOption" @chart-click="onEventTrendClick" />
          </PanelCard>

          <div class="pie-row flex-1">
            <PanelCard title="事件类型分布" accent="#ff7a6b">
              <CategoryPie :data="eventType" type="ring" @chart-click="onEventTypeClick" />
            </PanelCard>
            <PanelCard title="服务需求类型" accent="#4de3a5">
              <CategoryPie :data="demandCategory" type="rose" @chart-click="onDemandClick" />
            </PanelCard>
            <PanelCard title="服务需求趋势" accent="#9c6ade">
              <BaseChart :option="demandTrendOption" />
            </PanelCard>
          </div>
        </div>

        <!-- ===== 右列：人员与响应 ===== -->
        <div class="col">
          <PanelCard title="服务人员片区分布" accent="#4d8cff" class="h-280">
            <StaffScatter :data="staffDistribution" />
          </PanelCard>

          <PanelCard title="平均响应时长" accent="#ff9d4d" class="h-250">
            <template #extra>
              <div class="chart-tabs">
                <button class="mini-tab" :class="{ active: respMode === 'zone' }" @click="respMode = 'zone'">按片区</button>
                <button class="mini-tab" :class="{ active: respMode === 'bucket' }" @click="respMode = 'bucket'">时长分布</button>
              </div>
            </template>
            <BaseChart :option="responseAvgOption" />
          </PanelCard>

          <PanelCard title="人员在岗状态" class="flex-1">
            <BaseChart :option="staffStatusOption" />
          </PanelCard>
        </div>
      </main>

      <!-- 底部：词云 + 滚动播报 -->
      <footer class="footer-row">
        <PanelCard title="老人高频服务诉求" accent="#00d4ff">
          <HotWordCloud :data="hotwords" />
        </PanelCard>

        <PanelCard title="紧急事件滚动播报" accent="#e06666">
          <div class="marquee">
            <div class="marquee-track">
              <div v-for="(e, i) in marqueeList" :key="e.id + '-' + i" class="marquee-item">
                <span class="mq-time">{{ e.time }}</span>
                <span class="mq-type" :class="'lv-' + e.level">{{ e.type }}</span>
                <span class="mq-text">{{ e.zone }} · {{ e.elder }}（{{ e.age }}岁）</span>
                <span class="mq-status" :class="{ done: e.status === '已处置' }">{{ e.status }}</span>
              </div>
            </div>
          </div>
        </PanelCard>
      </footer>
    </div>
  </div>
</template>
