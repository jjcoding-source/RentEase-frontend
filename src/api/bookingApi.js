import api from './axiosInstance'

export const createBooking         = (data)         => api.post('/bookings',              data)
export const getMyBookings         = ()              => api.get('/bookings/my')
export const getOwnerBookings      = ()              => api.get('/bookings/owner')
export const getRentalHistory      = ()              => api.get('/bookings/history')
export const getOwnerRentalHistory = ()              => api.get('/bookings/owner/history')
export const updateBookingStatus   = (id, status)   => api.patch(`/bookings/${id}/status`, { status })