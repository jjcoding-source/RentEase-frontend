import api from './axiosInstance'

export const getNotifications  = ()   => api.get('/notifications')
export const markAllRead       = ()   => api.post('/notifications/mark-all-read')
export const markOneRead       = (id) => api.patch(`/notifications/${id}/read`)