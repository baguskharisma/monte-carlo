'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { travelDocumentService } from '@/services/travel-document.service'
import {
  TRAVEL_DOCUMENT_QUERY_KEYS,
  type GetTravelDocumentsParams,
  type CreateTravelDocumentRequest,
  type CancelTravelDocumentRequest,
} from '@/types/travel-document.types'
import { toast } from 'sonner'

// ==================== QUERIES ====================

/**
 * Get all travel documents with optional filters
 */
export function useTravelDocuments(params?: GetTravelDocumentsParams) {
  return useQuery({
    queryKey: TRAVEL_DOCUMENT_QUERY_KEYS.list(params),
    queryFn: () => travelDocumentService.getTravelDocuments(params),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })
}

/**
 * Get travel document by ID
 */
export function useTravelDocument(id: string) {
  return useQuery({
    queryKey: TRAVEL_DOCUMENT_QUERY_KEYS.detail(id),
    queryFn: () => travelDocumentService.getTravelDocumentById(id),
    enabled: !!id,
    staleTime: 60000,
  })
}

/**
 * Get travel document stats for dashboard
 */
export function useTravelDocumentStats() {
  return useQuery({
    queryKey: TRAVEL_DOCUMENT_QUERY_KEYS.stats(),
    queryFn: async () => {
      const response = await travelDocumentService.getTravelDocuments()
      const documents = response.data

      return {
        draft: documents.filter((d) => d.status === 'DRAFT').length,
        issued: documents.filter((d) => d.status === 'ISSUED').length,
        cancelled: documents.filter((d) => d.status === 'CANCELLED').length,
        total: documents.length,
      }
    },
    staleTime: 30000, // 30 seconds
  })
}

// ==================== MUTATIONS ====================

/**
 * Create new travel document mutation (DRAFT status)
 * Does NOT deduct coins
 * Invalidates: travel-documents queries
 */
export function useCreateTravelDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTravelDocumentRequest) =>
      travelDocumentService.createTravelDocument(data),
    onSuccess: () => {
      // Invalidate all travel documents queries
      queryClient.invalidateQueries({ queryKey: TRAVEL_DOCUMENT_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TRAVEL_DOCUMENT_QUERY_KEYS.stats() })

      toast.success('Travel document draft created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create travel document')
    },
  })
}

/**
 * Issue travel document mutation (DRAFT → ISSUED)
 * Deducts 10,000 coins from admin's balance
 * Invalidates: travel-documents, coin-balance, coin-transactions queries
 */
export function useIssueTravelDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => travelDocumentService.issueTravelDocument(id),
    onSuccess: (_, id) => {
      // Invalidate travel documents
      queryClient.invalidateQueries({ queryKey: TRAVEL_DOCUMENT_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TRAVEL_DOCUMENT_QUERY_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: TRAVEL_DOCUMENT_QUERY_KEYS.stats() })

      // Invalidate coin balance (coins were deducted)
      queryClient.invalidateQueries({ queryKey: ['coin-balance'] })
      queryClient.invalidateQueries({ queryKey: ['coin-transactions'] })

      toast.success('Travel document issued and coins deducted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to issue travel document')
    },
  })
}

/**
 * Cancel travel document mutation
 * Only DRAFT documents can be cancelled
 * No coin refund (draft was free)
 * Invalidates: travel-documents queries
 */
export function useCancelTravelDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelTravelDocumentRequest }) =>
      travelDocumentService.cancelTravelDocument(id, data),
    onSuccess: (_, variables) => {
      // Invalidate travel documents
      queryClient.invalidateQueries({ queryKey: TRAVEL_DOCUMENT_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TRAVEL_DOCUMENT_QUERY_KEYS.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: TRAVEL_DOCUMENT_QUERY_KEYS.stats() })

      toast.success('Travel document cancelled')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel travel document')
    },
  })
}
