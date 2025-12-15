import axiosInstance from '@/lib/axios';
import {
  CoinRequest,
  CoinTransaction,
  PaginatedResponse,
  BalanceResponse,
  CoinRequestStatus,
  CoinTransactionType,
} from '@/lib/api-types';

/**
 * Coin Service
 * Handles coin requests and transactions
 */

// Create Coin Request
export const createCoinRequest = async (amount: number, notes?: string) => {
  const response = await axiosInstance.post<CoinRequest>('/coin-requests', {
    amount,
    notes,
  });
  return response.data;
};

// Get All Coin Requests
export const getCoinRequests = async (params?: {
  page?: number;
  limit?: number;
  status?: CoinRequestStatus;
  adminId?: string;
}) => {
  const response = await axiosInstance.get<PaginatedResponse<CoinRequest>>(
    '/coin-requests',
    {
      params,
    }
  );
  return response.data;
};

// Get Coin Request by ID
export const getCoinRequestById = async (id: string) => {
  const response = await axiosInstance.get<CoinRequest>(`/coin-requests/${id}`);
  return response.data;
};

// Approve Coin Request (SUPER_ADMIN only)
export const approveCoinRequest = async (id: string, notes?: string) => {
  const response = await axiosInstance.patch<CoinRequest>(
    `/coin-requests/${id}/approve`,
    {
      notes,
    }
  );
  return response.data;
};

// Reject Coin Request (SUPER_ADMIN only)
export const rejectCoinRequest = async (id: string, rejectedReason: string) => {
  const response = await axiosInstance.patch<CoinRequest>(
    `/coin-requests/${id}/reject`,
    {
      rejectedReason,
    }
  );
  return response.data;
};

// Get Coin Transactions
export const getCoinTransactions = async (params?: {
  page?: number;
  limit?: number;
  type?: CoinTransactionType;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const response = await axiosInstance.get<PaginatedResponse<CoinTransaction>>(
    '/coin-transactions',
    {
      params,
    }
  );
  return response.data;
};

// Get Current Balance
export const getCoinBalance = async () => {
  const response = await axiosInstance.get<BalanceResponse>('/coin-transactions/balance');
  return response.data;
};

// Get Admin's Coin Balance (SUPER_ADMIN only)
export const getAdminCoinBalance = async (adminId: string) => {
  const response = await axiosInstance.get<BalanceResponse>(
    `/admins/${adminId}/coin-balance`
  );
  return response.data;
};

// Get Admin's Coin Transactions (SUPER_ADMIN only)
export const getAdminCoinTransactions = async (
  adminId: string,
  params?: {
    page?: number;
    limit?: number;
  }
) => {
  const response = await axiosInstance.get<PaginatedResponse<CoinTransaction>>(
    `/admins/${adminId}/coin-transactions`,
    {
      params,
    }
  );
  return response.data;
};
