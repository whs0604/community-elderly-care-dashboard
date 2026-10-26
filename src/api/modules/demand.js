// 服务需求 API
import { apiGet } from '@/api/request'

export const getDemandCategory = () => apiGet('/demand/category')
export const getDemandTrend = (params) => apiGet('/demand/trend', params)
export const getHotwords = () => apiGet('/hotwords')
