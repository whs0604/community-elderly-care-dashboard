// 健康指标 API
import { apiGet } from '@/api/request'

export const getHealthOverview = () => apiGet('/health/overview')
export const getHealthTrend = (params) => apiGet('/health/trend', params)
export const getHealthLatest = () => apiGet('/health/latest')
