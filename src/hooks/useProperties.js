import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProperties, getPropertyById,
  createProperty, updateProperty, deleteProperty
} from '../api/propertyApi'

export function useProperties(filters = {}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn:  () => getProperties(filters).then(r => r.data),
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
    mutationFn: createProperty,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}

export function useUpdateProperty(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => updateProperty(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}

export function useDeleteProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProperty,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}