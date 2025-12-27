import apiClient, { getErrorMessage } from '@/lib/api'
import type {
  TravelDocument,
  TravelDocumentsResponse,
  GetTravelDocumentsParams,
  CreateTravelDocumentRequest,
  CancelTravelDocumentRequest,
} from '@/types/travel-document.types'

/**
 * Travel Document Service
 * Handles all travel document (Surat Jalan) related API calls
 */
class TravelDocumentService {
  private readonly baseUrl = '/travel-documents'

  /**
   * Get all travel documents with optional filters
   * @param params - Query parameters for filtering documents
   * @returns Promise<TravelDocumentsResponse> - Paginated list of travel documents
   */
  async getTravelDocuments(params?: GetTravelDocumentsParams): Promise<TravelDocumentsResponse> {
    try {
      const response: unknown = await apiClient.get(this.baseUrl, { params })
      return response as TravelDocumentsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get travel document by ID
   * @param id - Travel document ID
   * @returns Promise<TravelDocument> - Document details with nested relations
   */
  async getTravelDocumentById(id: string): Promise<TravelDocument> {
    try {
      const response: unknown = await apiClient.get(`${this.baseUrl}/${id}`)
      return response as TravelDocument
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Create new travel document (DRAFT status)
   * Does NOT deduct coins - coins only deducted on issue
   * @param data - Travel document creation request
   * @returns Promise<TravelDocument> - Created draft document
   */
  async createTravelDocument(data: CreateTravelDocumentRequest): Promise<TravelDocument> {
    try {
      const response: unknown = await apiClient.post(this.baseUrl, data)
      return response as TravelDocument
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Issue travel document (DRAFT → ISSUED)
   * Deducts 10,000 coins from admin's balance
   * Creates CoinTransaction record
   * @param id - Travel document ID
   * @returns Promise<TravelDocument> - Issued document
   */
  async issueTravelDocument(id: string): Promise<TravelDocument> {
    try {
      const response: unknown = await apiClient.patch(`${this.baseUrl}/${id}/issue`)
      return response as TravelDocument
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Cancel travel document
   * Only DRAFT documents can be cancelled
   * No coin refund (draft creation was free)
   * @param id - Travel document ID
   * @param data - Cancellation request with reason
   * @returns Promise<TravelDocument> - Cancelled document
   */
  async cancelTravelDocument(
    id: string,
    data: CancelTravelDocumentRequest
  ): Promise<TravelDocument> {
    try {
      const response: unknown = await apiClient.patch(`${this.baseUrl}/${id}/cancel`, data)
      return response as TravelDocument
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}

export const travelDocumentService = new TravelDocumentService()
export default travelDocumentService
