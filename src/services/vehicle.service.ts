import axiosInstance from '@/lib/axios';
import { Vehicle, PaginatedResponse, VehicleType, VehicleStatus } from '@/lib/api-types';

/**
 * Vehicle Service
 * Handles vehicle fleet operations
 */

// Create Vehicle
export const createVehicle = async (data: {
  vehicleNumber: string;
  type: VehicleType;
  brand?: string;
  model?: string;
  capacity: number;
}) => {
  const response = await axiosInstance.post<Vehicle>('/vehicles', data);
  return response.data;
};

// Get All Vehicles with filters
export const getVehicles = async (params?: {
  page?: number;
  limit?: number;
  type?: VehicleType;
  status?: VehicleStatus;
  search?: string;
}) => {
  const response = await axiosInstance.get<PaginatedResponse<Vehicle>>('/vehicles', {
    params,
  });
  return response.data;
};

// Get Available Vehicles
export const getAvailableVehicles = async () => {
  const response = await axiosInstance.get<{ data: Vehicle[]; total: number }>(
    '/vehicles/available'
  );
  return response.data;
};

// Get Vehicle by ID
export const getVehicleById = async (id: string) => {
  const response = await axiosInstance.get<Vehicle>(`/vehicles/${id}`);
  return response.data;
};

// Update Vehicle
export const updateVehicle = async (
  id: string,
  data: Partial<{
    vehicleNumber: string;
    type: VehicleType;
    brand: string;
    model: string;
    capacity: number;
  }>
) => {
  const response = await axiosInstance.patch<Vehicle>(`/vehicles/${id}`, data);
  return response.data;
};

// Update Vehicle Status
export const updateVehicleStatus = async (id: string, status: VehicleStatus) => {
  const response = await axiosInstance.patch<Vehicle>(`/vehicles/${id}/status`, {
    status,
  });
  return response.data;
};

// Upload Vehicle Image
export const uploadVehicleImage = async (id: string, imageFile: File) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await axiosInstance.post<Vehicle>(`/vehicles/${id}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete Vehicle Image
export const deleteVehicleImage = async (id: string) => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/vehicles/${id}/image`
  );
  return response.data;
};

// Delete Vehicle (SUPER_ADMIN only)
export const deleteVehicle = async (id: string) => {
  const response = await axiosInstance.delete<{ message: string }>(`/vehicles/${id}`);
  return response.data;
};
