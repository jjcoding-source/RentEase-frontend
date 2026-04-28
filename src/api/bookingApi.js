import api from './axiosInstance'

export const createBooking       = (data)        => api.post('/bookings', data)
export const getMyBookings       = ()             => api.get('/bookings/my')
export const getOwnerBookings    = ()             => api.get('/bookings/owner')
export const updateBookingStatus = (id, status)  => api.patch(`/bookings/${id}/status`, { status })