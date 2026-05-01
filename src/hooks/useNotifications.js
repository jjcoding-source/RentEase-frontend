import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markAllRead, markOneRead } from '../api/notificationApi'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn:  () => getNotifications().then(r => r.data),
    refetchInterval: 1000 * 30, 
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllRead,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkOneRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => markOneRead(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}