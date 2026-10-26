// 响应时间 API
import { apiGet } from '@/api/request'

export const getResponseAvg = () => apiGet('/response/avg')
export const getResponseDistribution = () => apiGet('/response/distribution')
