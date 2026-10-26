// 紧急事件 API
import { apiGet } from '@/api/request'

export const getEventOverview = () => apiGet('/event/overview')
export const getEventTrend = (params) => apiGet('/event/trend', params)
export const getEventType = () => apiGet('/event/type')
export const getRecentEvents = (params) => apiGet('/event/recent', params)
