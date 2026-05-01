import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createBooking, getMyBookings, getOwnerBookings,
  getRentalHistory, getOwnerRentalHistory, updateBookingStatus,
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

export function useRentalHistory() {
  return useQuery({
    queryKey: ['bookings', 'history'],
    queryFn:  () => getRentalHistory().then(r => r.data),
  })
}

export function useOwnerRentalHistory() {
  return useQuery({
    queryKey: ['bookings', 'owner-history'],
    queryFn:  () => getOwnerRentalHistory().then(r => r.data),
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createBooking(data).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })
}