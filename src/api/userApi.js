import api from './axiosInstance'

export const getMe               = ()      => api.get('/users/me')
export const updateMe            = (data)  => api.put('/users/me',                    data)
export const changePassword      = (data)  => api.post('/users/me/change-password',   data)
export const updatePreferences   = (data)  => api.patch('/users/me/preferences',      data)
export const deleteMe            = ()      => api.delete('/users/me')