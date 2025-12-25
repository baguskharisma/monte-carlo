import apiClient, { getErrorMessage } from '@/lib/api'
import type {
  Ticket,
  TicketsResponse,
  GetTicketsParams,
  CreateTicketRequest,
  CancelTicketRequest,
} from '@/types/ticket.types'

/**
 * Ticket Service
 * Handles all ticket-related API calls
 */
class TicketService {
  private readonly baseUrl = '/tickets'

  /**
   * Get all tickets with optional filters
   * @param params - Query parameters for filtering tickets
   * @returns Promise<TicketsResponse> - Paginated list of tickets
   */
  async getTickets(params?: GetTicketsParams): Promise<TicketsResponse> {
    try {
      const response: unknown = await apiClient.get(this.baseUrl, { params })
      return response as TicketsResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get ticket by ID
   * @param id - Ticket ID
   * @returns Promise<Ticket> - Ticket details with nested relations
   */
  async getTicketById(id: string): Promise<Ticket> {
    try {
      const response: unknown = await apiClient.get(`${this.baseUrl}/${id}`)
      return response as Ticket
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Create new ticket (ADMIN_PANEL booking)
   * Auto-deducts coins from admin's balance
   * @param data - Ticket creation request
   * @returns Promise<Ticket> - Created ticket
   */
  async createTicket(data: CreateTicketRequest): Promise<Ticket> {
    try {
      const response: unknown = await apiClient.post(this.baseUrl, data)
      return response as Ticket
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Cancel ticket
   * Refunds coins if booking source is ADMIN_PANEL
   * @param id - Ticket ID
   * @param data - Cancellation request with reason
   * @returns Promise<Ticket> - Updated ticket
   */
  async cancelTicket(id: string, data: CancelTicketRequest): Promise<Ticket> {
    try {
      const response: unknown = await apiClient.patch(`${this.baseUrl}/${id}/cancel`, data)
      return response as Ticket
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}

export const ticketService = new TicketService()
