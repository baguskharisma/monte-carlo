import axiosInstance from '@/lib/axios';
import { PaymentProof, PaymentProofStatus, BookingSource } from '@/lib/api-types';

/**
 * Payment Proof Service
 * Handles payment proof upload and verification
 */

// Upload Payment Proof
export const uploadPaymentProof = async (data: {
  scheduleId: string;
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
  paymentProof: File;
}) => {
  const formData = new FormData();
  formData.append('scheduleId', data.scheduleId);
  formData.append('bookingSource', data.bookingSource);
  formData.append('bookerPhone', data.bookerPhone);
  formData.append('pickupAddress', data.pickupAddress);
  formData.append('dropoffAddress', data.dropoffAddress);
  formData.append('passengers', JSON.stringify(data.passengers));
  if (data.notes) {
    formData.append('notes', data.notes);
  }
  formData.append('paymentProof', data.paymentProof);

  const response = await axiosInstance.post<PaymentProof>('/payment-proofs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get All Payment Proofs (Admin only)
export const getPaymentProofs = async (status?: PaymentProofStatus) => {
  const response = await axiosInstance.get<PaymentProof[]>('/payment-proofs', {
    params: status ? { status } : undefined,
  });
  return response.data;
};

// Get Customer's Own Payment Proofs
export const getMyPaymentProofs = async () => {
  const response = await axiosInstance.get<PaymentProof[]>('/payment-proofs/my-proofs');
  return response.data;
};

// Get Payment Proof by ID
export const getPaymentProofById = async (id: string) => {
  const response = await axiosInstance.get<PaymentProof>(`/payment-proofs/${id}`);
  return response.data;
};

// Approve Payment Proof
export const approvePaymentProof = async (id: string, notes?: string) => {
  const response = await axiosInstance.patch<{
    paymentProof: PaymentProof;
    ticket: any;
  }>(`/payment-proofs/${id}/approve`, {
    notes,
  });
  return response.data;
};

// Reject Payment Proof
export const rejectPaymentProof = async (id: string, rejectedReason: string) => {
  const response = await axiosInstance.patch<PaymentProof>(
    `/payment-proofs/${id}/reject`,
    {
      rejectedReason,
    }
  );
  return response.data;
};

// Delete Payment Proof
export const deletePaymentProof = async (id: string) => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/payment-proofs/${id}`
  );
  return response.data;
};
