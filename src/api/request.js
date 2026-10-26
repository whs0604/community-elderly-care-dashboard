// ============================================================
// axios 统一封装
// - 拦截器统一处理返回 data / 错误
// - VITE_USE_MOCK=true 时走本地 Mock，否则请求真实 /api 接口
// ============================================================
import axios from 'axios'
import * as mockApi from '@/mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 响应拦截：直接返回 data，错误统一抛出
request.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err)
)

// Mock 路由表：url -> mock 生成函数
const MOCK_MAP = {
  '/health/overview': mockApi.getHealthOverview,
  '/health/trend': mockApi.getHealthTrend,
  '/health/latest': mockApi.getHealthLatest,
  '/demand/category': mockApi.getDemandCategory,
  '/demand/trend': mockApi.getDemandTrend,
  '/hotwords': mockApi.getHotwords,
  '/event/overview': mockApi.getEventOverview,
  '/event/trend': mockApi.getEventTrend,
  '/event/type': mockApi.getEventType,
  '/event/recent': mockApi.getRecentEvents,
  '/staff/distribution': mockApi.getStaffDistribution,
  '/staff/status': mockApi.getStaffStatus,
  '/response/avg': mockApi.getResponseAvg,
  '/response/distribution': mockApi.getResponseDistribution
}

/**
 * 统一 GET 出口：Mock 与真实接口无缝切换
 * @param {string} url
 * @param {object} params
 */
export function apiGet(url, params = {}) {
  if (USE_MOCK) {
    const fn = MOCK_MAP[url]
    if (fn) return fn(params)
    return Promise.reject(new Error('Mock 未配置该接口: ' + url))
  }
  return request.get(url, { params })
}

export default request
