import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMe, updateMe, changePassword, updatePreferences, deleteMe } from '../api/userApi'

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn:  () => getMe().then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateMe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => updateMe(data).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data) => changePassword(data).then(r => r.data),
  })
}

export function useUpdatePreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => updatePreferences(data).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useDeleteMe() {
  return useMutation({
    mutationFn: () => deleteMe(),
  })
}