import api from './axiosInstance'

export const getProperties   = (params) => api.get('/properties',              { params })
export const getPropertyById = (id)      => api.get(`/properties/${id}`)
export const createProperty  = (data)    => api.post('/properties',             data)
export const updateProperty  = (id, data)=> api.put(`/properties/${id}`,       data)
export const deleteProperty  = (id)      => api.delete(`/properties/${id}`)
export const getSavedProperties = ()     => api.get('/properties/saved')
export const toggleSaveProperty = (id)   => api.post(`/properties/${id}/save`)
export const unsaveProperty     = (id)   => api.delete(`/properties/${id}/save`)