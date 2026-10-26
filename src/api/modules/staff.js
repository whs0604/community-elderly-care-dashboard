// 服务人员 API
import { apiGet } from '@/api/request'

export const getStaffDistribution = () => apiGet('/staff/distribution')
export const getStaffStatus = () => apiGet('/staff/status')
