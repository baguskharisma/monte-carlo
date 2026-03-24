<<<<<<< HEAD
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
=======
/**
 * Vehicle Service
 * Service layer for vehicle CRUD operations
 */

import apiClient, { getErrorMessage } from '@/lib/api'
import type {
  GetVehiclesResponse,
  GetVehicleResponse,
  CreateVehicleResponse,
  UpdateVehicleResponse,
  DeleteVehicleResponse,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  GetVehiclesParams,
} from '@/types/vehicle.types'
import type { VehicleStatus } from '@/types/vehicle.types'

class VehicleService {
  /**
   * Fetch all vehicles with optional filters
   */
  async getVehicles(params?: GetVehiclesParams): Promise<GetVehiclesResponse> {
    try {
      const response: unknown = await apiClient.get('/vehicles', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          search: params?.search,
          type: params?.type,
          status: params?.status,
        },
      })
      return response as GetVehiclesResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Fetch a single vehicle by ID
   */
  async getVehicleById(id: string): Promise<GetVehicleResponse> {
    try {
      const response: unknown = await apiClient.get(`/vehicles/${id}`)
      return response as GetVehicleResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Create a new vehicle
   */
  async createVehicle(data: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    try {
      const payload = {
        vehicleNumber: data.vehicleNumber.toUpperCase().replace(/\s+/g, ' ').trim(),
        type: data.type,
        brand: data.brand.trim(),
        model: data.model.trim(),
        capacity: data.capacity,
      }

      console.log('Sending vehicle payload:', payload)
      const response: unknown = await apiClient.post('/vehicles', payload)
      return response as CreateVehicleResponse
    } catch (error: any) {
      // Log full error for debugging
      console.error('Full API error:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      })

      // Extract detailed validation errors from API response
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        getErrorMessage(error)

      // If there are validation errors, include them
      if (error?.response?.data?.errors) {
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ')
        throw new Error(`${errorMessage} - ${validationErrors}`)
      }

      // If there's a details array, include it
      if (error?.response?.data?.details) {
        const details = Array.isArray(error.response.data.details)
          ? error.response.data.details.map((d: any) => d.message || d).join(', ')
          : error.response.data.details
        throw new Error(`${errorMessage} - ${details}`)
      }

      throw new Error(errorMessage)
    }
  }

  /**
   * Update an existing vehicle
   * Note: Status updates should use updateVehicleStatus method separately
   */
  async updateVehicle(
    id: string,
    data: UpdateVehicleRequest
  ): Promise<UpdateVehicleResponse> {
    try {
      // Build payload - exclude status field (use dedicated endpoint for status)
      const payload: Record<string, any> = {}

      if (data.vehicleNumber !== undefined) {
        payload.vehicleNumber = data.vehicleNumber.toUpperCase().replace(/\s+/g, ' ').trim()
      }
      if (data.type !== undefined) {
        payload.type = data.type
      }
      if (data.brand !== undefined) {
        payload.brand = data.brand.trim()
      }
      if (data.model !== undefined) {
        payload.model = data.model.trim()
      }
      if (data.capacity !== undefined) {
        payload.capacity = data.capacity
      }

      console.log('Update vehicle ID:', id)
      console.log('Update vehicle payload (PATCH, no status):', payload)

      const response: unknown = await apiClient.patch(`/vehicles/${id}`, payload)
      console.log('Update vehicle response:', response)

      return response as UpdateVehicleResponse
    } catch (error: any) {
      // Log full error for debugging
      console.error('Update vehicle error:', {
        vehicleId: id,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        requestPayload: data,
      })

      // Extract detailed validation errors from API response
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        getErrorMessage(error)

      // If there are validation errors, include them
      if (error?.response?.data?.errors) {
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ')
        throw new Error(`${errorMessage} - ${validationErrors}`)
      }

      // If there's a details array, include it
      if (error?.response?.data?.details) {
        const details = Array.isArray(error.response.data.details)
          ? error.response.data.details.map((d: any) => d.message || d).join(', ')
          : error.response.data.details
        throw new Error(`${errorMessage} - ${details}`)
      }

      throw new Error(errorMessage)
    }
  }

  /**
   * Update vehicle status
   * Separate method for updating vehicle status only
   */
  async updateVehicleStatus(
    id: string,
    status: VehicleStatus
  ): Promise<UpdateVehicleResponse> {
    try {
      const response: unknown = await apiClient.patch(
        `/vehicles/${id}/status`,
        { status }
      )
      return response as UpdateVehicleResponse
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        getErrorMessage(error)
      throw new Error(errorMessage)
    }
  }

  /**
   * Delete a vehicle
   */
  async deleteVehicle(id: string): Promise<DeleteVehicleResponse> {
    try {
      const response: unknown = await apiClient.delete(`/vehicles/${id}`)
      return response as DeleteVehicleResponse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}

// Export singleton instance
export const vehicleService = new VehicleService()
>>>>>>> 44fac76cb1a89256af69385d641ed87f3744a645
