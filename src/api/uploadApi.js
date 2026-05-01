import api from './axiosInstance'

export async function uploadImages(files) {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))

  const res = await api.post('/uploads/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.urls 
}