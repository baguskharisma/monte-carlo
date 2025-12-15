/**
 * Type-safe Ticket Service
 * Uses generated types from OpenAPI spec
 *
 * Run: npm run generate:api to generate types
 */

import { apiClient, buildPath, buildQuery } from '@/lib/api-client';

// ==================== TYPES ====================

export interface Ticket {
  id: string;
  ticketNumber: string;
  scheduleId: string;
  customerId: string | null;
  adminId: string | null;
  bookingSource: 'CUSTOMER_APP' | 'ADMIN_PANEL';
  bookerPhone: string;
  pickupAddress: string;
  dropoffAddress: string;
  totalPassengers: number;
  totalPrice: number;
  status: 'PENDING_PAYMENT' | 'PENDING_APPROVAL' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
  bookingDate: string;
  paymentDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTickets {
  data: Ticket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Passenger {
  name: string;
  identityNumber?: string;
  phone?: string;
  seatNumber?: string;
}

export interface CreateTicketDto {
  scheduleId: string;
  customerId?: string;
  bookingSource: 'CUSTOMER_APP' | 'ADMIN_PANEL';
  bookerPhone: string;
  pickupAddress: string;
  dropoffAddress: string;
  passengers: Passenger[];
  notes?: string;
}

export interface TicketQueryParams {
  page?: number;
  limit?: number;
  scheduleId?: string;
  customerId?: string;
  adminId?: string;
  status?: Ticket['status'];
  bookingSource?: 'CUSTOMER_APP' | 'ADMIN_PANEL';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ==================== SERVICE FUNCTIONS ====================

/**
 * Get all tickets with optional filters
 */
export async function getTickets(
  params?: TicketQueryParams
): Promise<PaginatedTickets> {
  const query = params ? buildQuery(params) : '';
  return apiClient.get<PaginatedTickets>(`/tickets${query}`);
}

/**
 * Get ticket by ID
 */
export async function getTicketById(id: string): Promise<Ticket> {
  const path = buildPath('/tickets/{id}', { id });
  return apiClient.get<Ticket>(path);
}

/**
 * Create new ticket
 */
export async function createTicket(data: CreateTicketDto): Promise<Ticket> {
  return apiClient.post<Ticket, CreateTicketDto>('/tickets', data);
}

/**
 * Confirm ticket payment
 */
export async function confirmTicketPayment(id: string): Promise<Ticket> {
  const path = buildPath('/tickets/{id}/confirm', { id });
  return apiClient.patch<Ticket>(path);
}

/**
 * Cancel ticket
 */
export async function cancelTicket(id: string): Promise<Ticket> {
  const path = buildPath('/tickets/{id}/cancel', { id });
  return apiClient.patch<Ticket>(path);
}

/**
 * Delete ticket (SUPER_ADMIN only)
 */
export async function deleteTicket(id: string): Promise<{ message: string }> {
  const path = buildPath('/tickets/{id}', { id });
  return apiClient.delete<{ message: string }>(path);
}
