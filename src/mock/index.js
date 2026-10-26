// ============================================================
// Mock 数据生成器
// 模拟后端 5 大数据域：健康 / 需求 / 事件 / 人员 / 响应
// 每个接口带随机漂移，配合 30s 轮询让大屏“活”起来
// ============================================================
import dayjs from 'dayjs'

// ---------- 基础工具 ----------
const rand = (min, max, dec = 0) => {
  const v = Math.random() * (max - min) + min
  return dec ? +v.toFixed(dec) : Math.round(v)
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const chance = (p) => Math.random() < p
const mock = (data, delay = 180) =>
  new Promise((res) => setTimeout(() => res(data), delay))

// ---------- 常量池 ----------
const ZONES = ['东片区', '南片区', '西片区', '北片区', '中片区']
const DEMAND_TYPES = ['助餐', '助浴', '助医', '助洁', '陪护', '康复', '文娱']
const EVENT_TYPES = ['跌倒', '突发疾病', '走失', '火警', '煤气', '其他']
const LEVELS = ['一般', '紧急', '危急']
const POSTS = ['护理员', '护士', '社工', '志愿者']
const SUR = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '高']
const GIVEN = ['淑芬', '桂英', '秀兰', '玉梅', '建国', '志强', '国栋', '文博', '德福', '凤英', '春华', '庆丰', '永贵', '玉珍', '长海', '秀珍', '宝田', '桂芝', '淑珍', '万山']

// 老人池（320 位，覆盖 5 个片区）
const ELDERS = Array.from({ length: 320 }, (_, i) => ({
  elderId: 'E' + String(i + 1).padStart(4, '0'),
  name: pick(SUR) + pick(GIVEN),
  age: rand(65, 96),
  zone: pick(ZONES)
}))

// ---------- 健康指标 ----------
// 各指标正常区间 / 异常区间
const BAND = { hr: [60, 100], bp: [90, 140], bs: [3.9, 6.1] }
const SPIKE = { hr: [38, 132], bp: [70, 175], bs: [2.8, 8.5] }

function genSeries(count, band, spike) {
  return Array.from({ length: count }, () =>
    chance(0.12) ? rand(spike[0], spike[1], 1) : rand(band[0], band[1], 1)
  )
}

// 根据时间范围生成坐标标签：今日=24小时，本周=7天，本月=30天
function rangeLabels(range) {
  if (range === 'today') {
    return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00')
  }
  const days = range === 'month' ? 30 : 7
  return Array.from({ length: days }, (_, i) =>
    dayjs().subtract(days - 1 - i, 'day').format('MM-DD')
  )
}

// GET /api/health/trend?type=hr|bp|bs&range=today|week|month
export function getHealthTrend({ type = 'hr', range = 'week' } = {}) {
  const labels = rangeLabels(range)
  const band = BAND[type] || BAND.hr
  const spike = SPIKE[type] || SPIKE.hr
  const values = genSeries(labels.length, band, spike)
  const abnormal = values.filter((v) => v < band[0] || v > band[1]).length
  const average = +(values.reduce((s, v) => s + v, 0) / values.length).toFixed(1)
  return mock({ labels, values, average, abnormal })
}

// GET /api/health/overview
let overviewState = { total: ELDERS.length, normal: 228, warn: 64, abnormal: 9 }
export function getHealthOverview() {
  overviewState.normal = Math.min(260, Math.max(200, overviewState.normal + rand(-4, 4)))
  overviewState.warn = Math.min(90, Math.max(50, overviewState.warn + rand(-3, 3)))
  overviewState.abnormal = Math.min(16, Math.max(5, overviewState.abnormal + rand(-2, 2)))
  return mock({
    total: overviewState.total,
    normal: overviewState.normal,
    warn: overviewState.warn,
    abnormal: overviewState.abnormal
  })
}

// GET /api/health/latest（实时体征）
let latestState = { hr: 76, sbp: 128, dbp: 82 }
export function getHealthLatest() {
  latestState.hr = Math.min(120, Math.max(52, latestState.hr + rand(-4, 4)))
  latestState.sbp = Math.min(170, Math.max(100, latestState.sbp + rand(-4, 4)))
  latestState.dbp = Math.min(105, Math.max(55, latestState.dbp + rand(-3, 3)))
  return mock({
    hr: { name: '心率', value: latestState.hr, min: 40, max: 140, unit: 'bpm', color: '#ff7a6b' },
    sbp: { name: '收缩压', value: latestState.sbp, min: 80, max: 180, unit: 'mmHg', color: '#00d4ff' },
    dbp: { name: '舒张压', value: latestState.dbp, min: 50, max: 110, unit: 'mmHg', color: '#4de3a5' }
  })
}

// ---------- 服务需求 ----------
// GET /api/demand/category
let demandState = DEMAND_TYPES.map((name, i) => ({ name, value: 40 + i * 8 }))
export function getDemandCategory() {
  demandState = demandState.map((d) => ({
    name: d.name,
    value: Math.max(15, d.value + rand(-6, 7))
  }))
  return mock([...demandState].sort((a, b) => b.value - a.value))
}

// GET /api/demand/trend?range=
export function getDemandTrend({ range = 'week' } = {}) {
  const labels = rangeLabels(range)
  const values = Array.from({ length: labels.length }, () => rand(25, 75))
  return mock({ labels, values })
}

// GET /api/hotwords（高频诉求词云）
export function getHotwords() {
  return mock([
    { name: '助餐服务', value: 86 },
    { name: '上门理发', value: 72 },
    { name: '陪诊就医', value: 68 },
    { name: '血压复查', value: 61 },
    { name: '康复训练', value: 55 },
    { name: '代购药品', value: 50 },
    { name: '家政保洁', value: 46 },
    { name: '心理疏导', value: 42 },
    { name: '助浴服务', value: 38 },
    { name: '送餐上门', value: 36 },
    { name: '防跌倒指导', value: 32 },
    { name: '用药提醒', value: 30 },
    { name: '理发上门', value: 26 },
    { name: '陪聊天', value: 24 },
    { name: '修家电', value: 18 }
  ])
}

// ---------- 紧急事件 ----------
// GET /api/event/overview
let eventState = { todayTotal: 26, processing: 7, critical: 1, resolved: 18 }
export function getEventOverview() {
  const todayTotal = Math.max(15, eventState.todayTotal + rand(-2, 3))
  const critical = Math.max(0, Math.min(4, eventState.critical + rand(-1, 1)))
  const processing = Math.max(3, Math.min(todayTotal, eventState.processing + rand(-1, 2)))
  eventState = { todayTotal, processing, critical, resolved: todayTotal - processing }
  return mock({ ...eventState })
}

// GET /api/event/trend?range=
export function getEventTrend({ range = 'week' } = {}) {
  const labels = rangeLabels(range)
  const values = labels.map((_, i) =>
    range === 'today' ? rand(0, 6) : i % 7 === 6 ? rand(10, 24) : rand(4, 16)
  )
  return mock({ labels, values })
}

// GET /api/event/type
let eventTypeState = EVENT_TYPES.map((name, i) => ({ name, value: 8 + i * 3 }))
export function getEventType() {
  eventTypeState = eventTypeState.map((d) => ({
    name: d.name,
    value: Math.max(2, d.value + rand(-2, 4))
  }))
  return mock([...eventTypeState].sort((a, b) => b.value - a.value))
}

// GET /api/event/recent（滚动播报用）
export function getRecentEvents({ count = 9 } = {}) {
  const events = Array.from({ length: count }, (_, i) => {
    const elder = ELDERS[rand(0, ELDERS.length - 1)]
    const level = chance(0.5) ? '一般' : chance(0.6) ? '紧急' : '危急'
    const minsAgo = i * rand(8, 20)
    const resolved = minsAgo > 40
    return {
      id: 'EV' + Date.now() + i,
      time: dayjs().subtract(minsAgo, 'minute').format('HH:mm'),
      elder: elder.name,
      age: elder.age,
      zone: elder.zone,
      type: pick(EVENT_TYPES),
      level,
      status: resolved ? '已处置' : '处理中'
    }
  })
  return mock(events)
}

// ---------- 服务人员 ----------
// 片区基准坐标（散点图的“社区服务网格”）
const ZONE_POS = {
  东片区: [18, 62],
  南片区: [38, 40],
  西片区: [55, 68],
  北片区: [78, 36],
  中片区: [90, 60]
}

// GET /api/staff/distribution
let staffState = ZONES.map((zone) => ({ zone, total: rand(20, 42), onDuty: rand(14, 30) }))
export function getStaffDistribution() {
  staffState = staffState.map((s) => {
    const zone = s.zone || s.name // HMR/二次轮询时元素只有 name 字段
    const total = Math.max(16, s.total + rand(-2, 2))
    const onDuty = Math.min(total, Math.max(10, s.onDuty + rand(-2, 2)))
    const [bx, by] = ZONE_POS[zone] || [50, 50]
    return {
      zone,
      name: zone,
      value: [bx + rand(-4, 4), by + rand(-4, 4), total],
      onDuty,
      total
    }
  })
  return mock(staffState)
}

// GET /api/staff/status
export function getStaffStatus() {
  return mock(
    POSTS.map((post) => ({
      name: post,
      onDuty: rand(10, 26),
      total: rand(14, 34)
    }))
  )
}

// ---------- 响应时间 ----------
// GET /api/response/avg
export function getResponseAvg() {
  return mock(
    ZONES.map((zone) => {
      const avg = rand(8, 22, 1)
      return { zone, avg, max: +(avg + rand(4, 14, 1)) }
    })
  )
}

// GET /api/response/distribution
export function getResponseDistribution() {
  const base = [6, 18, 30, 22, 10, 4]
  return mock(
    ['<5分', '5-10分', '10-15分', '15-20分', '20-30分', '>30分'].map((name, i) => ({
      name,
      value: Math.max(1, base[i] + rand(-3, 3))
    }))
  )
}
