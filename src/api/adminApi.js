import api from './axiosInstance'

export const getAdminStats      = ()   => api.get('/admin/stats')
export const getAdminUsers      = ()   => api.get('/admin/users')
export const getAdminProperties = ()   => api.get('/admin/properties')
export const getAdminBookings   = ()   => api.get('/admin/bookings')
export const approveProperty    = (id) => api.patch(`/admin/properties/${id}/approve`)
export const rejectProperty     = (id) => api.patch(`/admin/properties/${id}/reject`)
export const deactivateUser     = (id) => api.patch(`/admin/users/${id}/deactivate`)
export const activateUser       = (id) => api.patch(`/admin/users/${id}/activate`)