/**
 * User and Profile Type Definitions
 * Based on backend API OpenAPI specification
 */

// User Role Enum
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'DRIVER' | 'CUSTOMER';

// User Status Enum
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

// Gender Enum
export type Gender = 'MALE' | 'FEMALE';

// Driver Status Enum
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY';

/**
 * Base User Profile Interface
 */
export interface UserProfile {
  name: string; // Backend uses 'name' instead of 'fullName'
  gender: Gender;
  birthDate: string | null;
  address: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Admin-specific Profile
 */
export interface AdminProfile extends UserProfile {
  coinBalance: number;
}

/**
 * Driver-specific Profile
 */
export interface DriverProfile extends UserProfile {
  licenseNumber: string;
  licenseExpiryDate: string;
  licenseImageUrl: string | null;
  status: DriverStatus;
}

/**
 * Customer-specific Profile
 */
export interface CustomerProfile extends UserProfile {
  // Customer may have additional specific fields in future
}

/**
 * Base User Interface
 */
export interface User {
  id: string;
  phone: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

/**
 * Admin User Interface
 */
export interface Admin extends Omit<User, 'profile'> {
  role: 'ADMIN' | 'SUPER_ADMIN';
  profile: AdminProfile;
}

/**
 * Driver User Interface
 */
export interface Driver extends Omit<User, 'profile' | 'role'> {
  role: 'DRIVER';
  profile: DriverProfile;
}

/**
 * Customer User Interface
 */
export interface Customer extends Omit<User, 'profile' | 'role'> {
  role: 'CUSTOMER';
  profile: CustomerProfile;
}

/**
 * Type guard to check if user is Admin or Super Admin
 */
export function isAdmin(user: User): user is Admin {
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
}

/**
 * Type guard to check if user is Super Admin
 */
export function isSuperAdmin(user: User): boolean {
  return user.role === 'SUPER_ADMIN';
}

/**
 * Type guard to check if user is Driver
 */
export function isDriver(user: User): user is Driver {
  return user.role === 'DRIVER';
}

/**
 * Type guard to check if user is Customer
 */
export function isCustomer(user: User): user is Customer {
  return user.role === 'CUSTOMER';
}
