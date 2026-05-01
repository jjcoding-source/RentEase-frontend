import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProperties, getPropertyById,
  createProperty, updateProperty, deleteProperty,
  getSavedProperties, toggleSaveProperty, unsaveProperty,
} from '../api/propertyApi'

export function useProperties(filters = {}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn:  () => getProperties(filters).then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })
}

export function useProperty(id) {
  return useQuery({
    queryKey: ['property', id],
    queryFn:  () => getPropertyById(id).then(r => r.data),
    enabled:  !!id,
  })
}

export function useCreateProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createProperty(data).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}

export function useUpdateProperty(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => updateProperty(id, data).then(r => r.data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['properties'] })
      qc.invalidateQueries({ queryKey: ['property', id] })
    },
  })
}

export function useDeleteProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteProperty(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}

export function useSavedProperties() {
  return useQuery({
    queryKey: ['saved-properties'],
    queryFn:  () => getSavedProperties().then(r => r.data),
  })
}

export function useToggleSave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => toggleSaveProperty(id).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['saved-properties'] }),
  })
}

export function useUnsaveProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => unsaveProperty(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['saved-properties'] }),
  })
}