import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createBooking, getMyBookings,
  getOwnerBookings, updateBookingStatus
} from '../api/bookingApi'

export function useMyBookings() {
  return useQuery({
    queryKey: ['bookings', 'my'],
    queryFn:  () => getMyBookings().then(r => r.data),
  })
}

export function useOwnerBookings() {
  return useQuery({
    queryKey: ['bookings', 'owner'],
    queryFn:  () => getOwnerBookings().then(r => r.data),
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBooking,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })
}