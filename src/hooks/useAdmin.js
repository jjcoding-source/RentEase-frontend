import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminStats, getAdminUsers, getAdminProperties,
  getAdminBookings, approveProperty, rejectProperty,
  deactivateUser, activateUser,
} from '../api/adminApi'

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn:  () => getAdminStats().then(r => r.data),
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn:  () => getAdminUsers().then(r => r.data),
  })
}

export function useAdminProperties() {
  return useQuery({
    queryKey: ['admin', 'properties'],
    queryFn:  () => getAdminProperties().then(r => r.data),
  })
}

export function useAdminBookings() {
  return useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn:  () => getAdminBookings().then(r => r.data),
  })
}

export function useApproveProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => approveProperty(id).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'properties'] }),
  })
}

export function useRejectProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => rejectProperty(id).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'properties'] }),
  })
}

export function useToggleUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }) =>
      isActive ? deactivateUser(id) : activateUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}