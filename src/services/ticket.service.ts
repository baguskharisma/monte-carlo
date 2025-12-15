import axiosInstance from '@/lib/axios';
import { Ticket, PaginatedResponse, TicketStatus, BookingSource } from '@/lib/api-types';

/**
 * Ticket Service
 * Handles ticket booking operations
 */

// Create Ticket Booking
export const createTicket = async (data: {
  scheduleId: string;
  customerId?: string;
  bookingSource: BookingSource;
  bookerPhone: string;
  pickupAddress: string;
  dropoffAddress: string;
  passengers: Array<{
    name: string;
    identityNumber?: string;
    phone?: string;
    seatNumber?: string;
  }>;
  notes?: string;
}) => {
  const response = await axiosInstance.post<Ticket>('/tickets', data);
  return response.data;
};

// Get All Tickets with filters
export const getTickets = async (params?: {
  page?: number;
  limit?: number;
  scheduleId?: string;
  customerId?: string;
  adminId?: string;
  status?: TicketStatus;
  bookingSource?: BookingSource;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const response = await axiosInstance.get<PaginatedResponse<Ticket>>('/tickets', {
    params,
  });
  return response.data;
};

// Get Ticket by ID
export const getTicketById = async (id: string) => {
  const response = await axiosInstance.get<Ticket>(`/tickets/${id}`);
  return response.data;
};

// Confirm Payment
export const confirmTicketPayment = async (id: string) => {
  const response = await axiosInstance.patch<Ticket>(`/tickets/${id}/confirm`);
  return response.data;
};

// Cancel Ticket
export const cancelTicket = async (id: string) => {
  const response = await axiosInstance.patch<Ticket>(`/tickets/${id}/cancel`);
  return response.data;
};

// Delete Ticket (SUPER_ADMIN only)
export const deleteTicket = async (id: string) => {
  const response = await axiosInstance.delete<{ message: string }>(`/tickets/${id}`);
  return response.data;
};
