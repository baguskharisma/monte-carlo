import axiosInstance from '@/lib/axios';
import { Route, PaginatedResponse } from '@/lib/api-types';

/**
 * Route Service
 * Handles travel route operations
 */

// Create Route
export const createRoute = async (data: {
  routeCode: string;
  origin: string;
  destination: string;
  distance?: number;
  estimatedDuration?: number;
  basePrice: number;
}) => {
  const response = await axiosInstance.post<Route>('/routes', data);
  return response.data;
};

// Get All Routes with filters
export const getRoutes = async (params?: {
  page?: number;
  limit?: number;
  origin?: string;
  destination?: string;
  isActive?: boolean;
  search?: string;
}) => {
  const response = await axiosInstance.get<PaginatedResponse<Route>>('/routes', {
    params,
  });
  return response.data;
};

// Get Route by ID
export const getRouteById = async (id: string) => {
  const response = await axiosInstance.get<Route>(`/routes/${id}`);
  return response.data;
};

// Update Route
export const updateRoute = async (
  id: string,
  data: Partial<{
    routeCode: string;
    origin: string;
    destination: string;
    distance: number;
    estimatedDuration: number;
    basePrice: number;
    isActive: boolean;
  }>
) => {
  const response = await axiosInstance.patch<Route>(`/routes/${id}`, data);
  return response.data;
};

// Delete Route (Soft delete)
export const deleteRoute = async (id: string) => {
  const response = await axiosInstance.delete<{ message: string }>(`/routes/${id}`);
  return response.data;
};

// Restore Route (SUPER_ADMIN only)
export const restoreRoute = async (id: string) => {
  const response = await axiosInstance.patch<Route>(`/routes/${id}/restore`);
  return response.data;
};
