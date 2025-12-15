# API Services Documentation

Dokumentasi lengkap untuk menggunakan API services dalam aplikasi Travel Management System.

## 📁 Struktur File

```
src/
├── lib/
│   ├── axios.ts          # Axios instance dengan base configuration
│   └── api-types.ts      # TypeScript types untuk API responses
└── services/
    ├── auth.service.ts           # Authentication & OTP
    ├── schedule.service.ts       # Trip schedules
    ├── ticket.service.ts         # Ticket booking
    ├── payment-proof.service.ts  # Payment proof upload
    ├── route.service.ts          # Travel routes
    ├── vehicle.service.ts        # Vehicle management
    └── coin.service.ts           # Coin system
```

## 🔧 Setup

### 1. Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### 2. Install Dependencies

Axios sudah terinstall di project ini (version 1.13.2).

## 🚀 Cara Penggunaan

### Authentication Service

#### Login
```typescript
import { login } from '@/services/auth.service';

try {
  const result = await login('081234567890', 'Admin123');

  // Simpan token
  localStorage.setItem('access_token', result.accessToken);
  localStorage.setItem('refresh_token', result.refreshToken);

  console.log('User:', result.user);
} catch (error) {
  console.error('Login failed:', error);
}
```

#### Register dengan OTP Verification
```typescript
import { sendOtp, verifyOtp, register } from '@/services/auth.service';

// Step 1: Send OTP
const otpResult = await sendOtp('081234567890');
console.log('OTP sent, expires in:', otpResult.expiresIn);

// Step 2: Verify OTP (user input code)
const verifyResult = await verifyOtp('081234567890', '123456');
console.log('OTP verified:', verifyResult.verified);

// Step 3: Register (within 30 minutes)
const registerResult = await register({
  name: 'John Doe',
  phone: '081234567890',
  email: 'john@example.com',
  password: 'Customer123',
  address: 'Jl. Sudirman No. 123',
  birthDate: '1990-05-15',
  gender: 'MALE'
});

localStorage.setItem('access_token', registerResult.accessToken);
```

#### Logout
```typescript
import { logout } from '@/services/auth.service';

await logout();
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

---

### Schedule Service

#### Get Upcoming Schedules
```typescript
import { getUpcomingSchedules } from '@/services/schedule.service';

const { data, total } = await getUpcomingSchedules(20);
console.log('Found', total, 'schedules');
```

#### Search Schedules
```typescript
import { getSchedules } from '@/services/schedule.service';

const result = await getSchedules({
  origin: 'Jakarta',
  destination: 'Bandung',
  dateFrom: '2025-01-10T00:00:00Z',
  dateTo: '2025-01-15T23:59:59Z',
  sortBy: 'cheapest',
  page: 1,
  limit: 10
});

console.log('Schedules:', result.data);
console.log('Total pages:', result.meta.totalPages);
```

#### Get Booked Seats (untuk seat selection)
```typescript
import { getBookedSeats } from '@/services/schedule.service';

const { bookedSeats, bookedSeatsWithStatus } = await getBookedSeats('schedule-id');

// bookedSeats: [1, 2, 3, 5, 7]
// bookedSeatsWithStatus: [
//   { seatNumber: 1, status: 'APPROVED' },
//   { seatNumber: 2, status: 'PENDING' },
//   ...
// ]

// Gunakan untuk disable seats di UI
const isDisabled = bookedSeats.includes(seatNumber);
```

---

### Payment Proof Service (Recommended untuk Customer Booking)

#### Upload Payment Proof
```typescript
import { uploadPaymentProof } from '@/services/payment-proof.service';

const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const result = await uploadPaymentProof({
  scheduleId: 'schedule-uuid',
  bookingSource: 'CUSTOMER_APP',
  bookerPhone: '081234567890',
  pickupAddress: 'Jl. Gatot Subroto No. 789, Jakarta',
  dropoffAddress: 'Jl. Asia Afrika No. 321, Bandung',
  passengers: [
    {
      name: 'Jane Smith',
      identityNumber: '1234567890123456',
      phone: '081234567890',
      seatNumber: 'A1'
    }
  ],
  notes: 'Transfer via BCA',
  paymentProof: file
});

console.log('Payment proof uploaded:', result.id);
```

#### Check Payment Proof Status (Customer)
```typescript
import { getMyPaymentProofs } from '@/services/payment-proof.service';

const myProofs = await getMyPaymentProofs();

myProofs.forEach(proof => {
  console.log(`Proof ${proof.id}: ${proof.status}`);
  // PENDING, APPROVED, or REJECTED
});
```

#### Approve Payment Proof (Admin)
```typescript
import { approvePaymentProof } from '@/services/payment-proof.service';

const { paymentProof, ticket } = await approvePaymentProof(
  'proof-id',
  'Payment verified'
);

console.log('Ticket created:', ticket.ticketNumber);
```

---

### Ticket Service (Direct Booking)

#### Create Ticket (Admin Panel)
```typescript
import { createTicket } from '@/services/ticket.service';

const ticket = await createTicket({
  scheduleId: 'schedule-uuid',
  bookingSource: 'ADMIN_PANEL',
  bookerPhone: '081234567890',
  pickupAddress: 'Jl. Sudirman No. 123, Jakarta Pusat',
  dropoffAddress: 'Jl. Dago No. 456, Bandung',
  passengers: [
    {
      name: 'John Doe',
      identityNumber: '1234567890123456',
      phone: '081234567890',
      seatNumber: 'A1'
    },
    {
      name: 'Jane Doe',
      identityNumber: '6543210987654321',
      phone: '081234567891',
      seatNumber: 'A2'
    }
  ],
  notes: 'Please call 30 minutes before pickup'
});

console.log('Ticket Number:', ticket.ticketNumber);
console.log('Total Price:', ticket.totalPrice);
// Note: Coins akan otomatis terpotong 10,000 per passenger
```

#### Get Tickets with filters
```typescript
import { getTickets } from '@/services/ticket.service';

const result = await getTickets({
  status: 'CONFIRMED',
  dateFrom: '2025-01-01T00:00:00Z',
  dateTo: '2025-01-31T23:59:59Z',
  page: 1,
  limit: 10
});

console.log('Tickets:', result.data);
console.log('Total:', result.meta.total);
```

---

### Route Service

#### Create Route
```typescript
import { createRoute } from '@/services/route.service';

const route = await createRoute({
  routeCode: 'JKT-BDG-001',
  origin: 'Jakarta',
  destination: 'Bandung',
  distance: 150,
  estimatedDuration: 180, // minutes
  basePrice: 100000
});
```

#### Get Active Routes
```typescript
import { getRoutes } from '@/services/route.service';

const { data } = await getRoutes({
  isActive: true,
  page: 1,
  limit: 100
});
```

---

### Vehicle Service

#### Create Vehicle
```typescript
import { createVehicle } from '@/services/vehicle.service';

const vehicle = await createVehicle({
  vehicleNumber: 'B 1234 ABC',
  type: 'EKSEKUTIF',
  brand: 'Mercedes-Benz',
  model: 'Sprinter',
  capacity: 16
});
```

#### Upload Vehicle Image
```typescript
import { uploadVehicleImage } from '@/services/vehicle.service';

const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

await uploadVehicleImage('vehicle-id', file);
```

#### Get Available Vehicles
```typescript
import { getAvailableVehicles } from '@/services/vehicle.service';

const { data, total } = await getAvailableVehicles();
console.log(`${total} vehicles available`);
```

---

### Coin Service

#### Check Coin Balance
```typescript
import { getCoinBalance } from '@/services/coin.service';

const balance = await getCoinBalance();
console.log(`Balance: ${balance.coinBalance} coins`);
```

#### Request Coin Top-up
```typescript
import { createCoinRequest } from '@/services/coin.service';

const request = await createCoinRequest(
  100000,
  'Top-up for monthly operations'
);

console.log('Request status:', request.status); // PENDING
```

#### Approve Coin Request (SUPER_ADMIN)
```typescript
import { approveCoinRequest } from '@/services/coin.service';

const approved = await approveCoinRequest(
  'request-id',
  'Approved for Q1 operations'
);

console.log('Approved amount:', approved.amount);
```

---

## 🔐 Axios Interceptors

Axios instance sudah dilengkapi dengan interceptors:

### Request Interceptor
- Otomatis menambahkan `Authorization: Bearer <token>` dari localStorage
- Semua request akan include JWT token

### Response Interceptor
- Handle error responses secara global
- Auto redirect ke `/login` jika token expired (401)
- Log error untuk debugging

## 🎯 Error Handling

```typescript
import { AxiosError } from 'axios';
import { ApiError } from '@/lib/api-types';

try {
  await login('081234567890', 'wrongpassword');
} catch (error) {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;

    console.log('Status Code:', apiError.statusCode);
    console.log('Message:', apiError.message);
    console.log('Error:', apiError.error);

    // Handle specific errors
    if (apiError.statusCode === 401) {
      // Unauthorized - wrong credentials
    } else if (apiError.statusCode === 400) {
      // Validation error
    }
  }
}
```

## 📊 TypeScript Types

Semua response types sudah didefinisikan di `src/lib/api-types.ts`:

```typescript
import type {
  Schedule,
  Ticket,
  Route,
  Vehicle,
  PaginatedResponse,
  AuthResponse,
  ApiError
} from '@/lib/api-types';
```

## 🔄 Integration dengan React Query (Recommended)

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getUpcomingSchedules } from '@/services/schedule.service';

export function ScheduleList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['schedules', 'upcoming'],
    queryFn: () => getUpcomingSchedules(20),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(schedule => (
        <div key={schedule.id}>
          {schedule.route?.origin} → {schedule.route?.destination}
          <br />
          Price: Rp {schedule.price.toLocaleString()}
        </div>
      ))}
    </div>
  );
}
```

## 📝 Notes

1. **Base URL**: Semua request akan menggunakan base URL dari `NEXT_PUBLIC_API_URL`
2. **Token Storage**: Token disimpan di `localStorage` (bisa diganti dengan cookies untuk SSR)
3. **Auto Logout**: Jika token expired, user akan otomatis redirect ke `/login`
4. **File Upload**: Gunakan `FormData` untuk upload file (payment proof, images)
5. **Pagination**: Semua list endpoints support pagination dengan `page` dan `limit`

## 🚨 Important

- Ganti `NEXT_PUBLIC_API_URL` di `.env.local` sesuai dengan backend URL Anda
- Token akan auto-expired sesuai konfigurasi backend
- Gunakan Payment Proof flow untuk customer bookings (recommended)
- Direct ticket booking akan memotong coins otomatis (10,000/passenger untuk admin)
