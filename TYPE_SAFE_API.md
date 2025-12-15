# Type-safe API Client Documentation

Complete guide untuk menggunakan type-safe API client yang di-generate dari OpenAPI specification.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Generating Types](#generating-types)
4. [Using Generated Types](#using-generated-types)
5. [API Client](#api-client)
6. [Type-safe Services](#type-safe-services)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

---

## 🎯 Overview

System ini menggunakan OpenAPI specification untuk:
- ✅ Generate TypeScript types dari OpenAPI spec
- ✅ Type-safe API requests & responses
- ✅ Auto-complete & IntelliSense
- ✅ Compile-time type checking
- ✅ Sync frontend types dengan backend API

### Architecture

```
docs/api-documentation.yaml (OpenAPI Spec)
          ↓
   npm run generate:api
          ↓
src/generated/api.ts (Generated Types)
          ↓
src/lib/api-client.ts (Type-safe Client)
          ↓
src/services/typed/*.service.ts (Type-safe Services)
          ↓
Your Components (100% Type-safe!)
```

---

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install --save-dev openapi-typescript nodemon
```

### 2. Files Created

- ✅ **[scripts/generate-api-types.js](scripts/generate-api-types.js)** - Generation script
- ✅ **[openapi-ts.config.ts](openapi-ts.config.ts)** - Configuration
- ✅ **[src/lib/api-client.ts](src/lib/api-client.ts)** - Type-safe API client
- ✅ **[src/generated/](src/generated/)** - Generated types (git-ignored)

### 3. Package.json Scripts

```json
{
  "scripts": {
    "generate:api": "node scripts/generate-api-types.js",
    "generate:api:watch": "nodemon --watch docs/api-documentation.yaml --exec npm run generate:api"
  }
}
```

---

## 🔨 Generating Types

### Generate Once

```bash
npm run generate:api
```

**Output:**
```
🚀 Generating API types from OpenAPI spec...
📝 Running: npx openapi-typescript docs/api-documentation.yaml -o src/generated/api.ts --alphabetize

✅ API types generated successfully!
📁 Output: src/generated/api.ts

💡 Import types with:
   import type { components } from '@/generated/api';
```

### Watch Mode (Auto-regenerate)

```bash
npm run generate:api:watch
```

Watches `docs/api-documentation.yaml` dan auto-regenerate saat ada perubahan.

---

## 📦 Using Generated Types

### Import Types

```typescript
// Import all generated types
import type { components, paths, operations } from '@/generated/api';

// Use component schemas
type Schedule = components['schemas']['Schedule'];
type Ticket = components['schemas']['Ticket'];
type User = components['schemas']['User'];
type Route = components['schemas']['Route'];
type Vehicle = components['schemas']['Vehicle'];

// Use path types (request/response)
type GetSchedulesResponse =
  paths['/schedules']['get']['responses']['200']['content']['application/json'];

type CreateTicketRequest =
  paths['/tickets']['post']['requestBody']['content']['application/json'];

type CreateTicketResponse =
  paths['/tickets']['post']['responses']['201']['content']['application/json'];
```

### Component Schemas

```typescript
import type { components } from '@/generated/api';

// All schemas from OpenAPI spec
type Schedule = components['schemas']['Schedule'];
// {
//   id: string;
//   routeId: string;
//   vehicleId: string;
//   departureTime: string;
//   price: number;
//   ...
// }

type Ticket = components['schemas']['Ticket'];
type PaginatedResponse<T> = components['schemas']['PaginatedResponse'] & {
  data: T[];
};
```

### Path Types

```typescript
import type { paths } from '@/generated/api';

// GET /schedules
type GetSchedulesParams =
  paths['/schedules']['get']['parameters']['query'];
type GetSchedulesResponse =
  paths['/schedules']['get']['responses']['200']['content']['application/json'];

// POST /tickets
type CreateTicketBody =
  paths['/tickets']['post']['requestBody']['content']['application/json'];
type CreateTicketResponse =
  paths['/tickets']['post']['responses']['201']['content']['application/json'];

// PATCH /schedules/{id}
type UpdateSchedulePath =
  paths['/schedules/{id}']['patch']['parameters']['path'];
type UpdateScheduleBody =
  paths['/schedules/{id}']['patch']['requestBody']['content']['application/json'];
```

### Operation Types

```typescript
import type { operations } from '@/generated/api';

// Operations keyed by operationId
type GetSchedules = operations['getSchedules'];
type CreateTicket = operations['createTicket'];
type UpdateSchedule = operations['updateSchedule'];
```

---

## 🔧 API Client

### Basic Usage

```typescript
import { apiClient } from '@/lib/api-client';
import type { components } from '@/generated/api';

type Schedule = components['schemas']['Schedule'];

// GET request
const schedule = await apiClient.get<Schedule>('/schedules/123');

// POST request
const newTicket = await apiClient.post<Ticket, CreateTicketDto>(
  '/tickets',
  {
    scheduleId: '123',
    passengers: [...],
    ...
  }
);

// PATCH request
const updated = await apiClient.patch<Schedule>('/schedules/123', {
  price: 150000,
});

// DELETE request
await apiClient.delete('/schedules/123');
```

### Path Building

```typescript
import { buildPath, buildQuery } from '@/lib/api-client';

// Build path with parameters
const path = buildPath('/schedules/{id}/tickets/{ticketId}', {
  id: '123',
  ticketId: '456',
});
// Result: '/schedules/123/tickets/456'

// Build query string
const query = buildQuery({
  page: 1,
  limit: 10,
  status: 'ACTIVE',
  search: 'Jakarta',
});
// Result: '?page=1&limit=10&status=ACTIVE&search=Jakarta'
```

### File Upload

```typescript
import { apiClient } from '@/lib/api-client';

const formData = new FormData();
formData.append('paymentProof', file);
formData.append('scheduleId', scheduleId);

const result = await apiClient.upload<PaymentProof>(
  '/payment-proofs',
  formData
);
```

---

## 🎯 Type-safe Services

### Example: Schedule Service

```typescript
// src/services/typed/schedule.service.ts
import { apiClient, buildPath, buildQuery } from '@/lib/api-client';
import type { components, paths } from '@/generated/api';

// Use generated types
type Schedule = components['schemas']['Schedule'];
type GetSchedulesResponse =
  paths['/schedules']['get']['responses']['200']['content']['application/json'];
type CreateScheduleDto =
  paths['/schedules']['post']['requestBody']['content']['application/json'];

// Type-safe service function
export async function getSchedules(
  params?: {
    page?: number;
    limit?: number;
    status?: 'SCHEDULED' | 'DEPARTED' | 'ARRIVED' | 'CANCELLED';
  }
): Promise<GetSchedulesResponse> {
  const query = params ? buildQuery(params) : '';
  return apiClient.get<GetSchedulesResponse>(`/schedules${query}`);
}

export async function getScheduleById(id: string): Promise<Schedule> {
  const path = buildPath('/schedules/{id}', { id });
  return apiClient.get<Schedule>(path);
}

export async function createSchedule(
  data: CreateScheduleDto
): Promise<Schedule> {
  return apiClient.post<Schedule, CreateScheduleDto>('/schedules', data);
}
```

### Example: Ticket Service

```typescript
// src/services/typed/ticket.service.ts
import { apiClient, buildPath } from '@/lib/api-client';
import type { components } from '@/generated/api';

type Ticket = components['schemas']['Ticket'];
type CreateTicketDto = components['schemas']['CreateTicketDto'];

export async function createTicket(
  data: CreateTicketDto
): Promise<Ticket> {
  // TypeScript will enforce correct data structure
  return apiClient.post<Ticket, CreateTicketDto>('/tickets', data);
}

export async function getTicketById(id: string): Promise<Ticket> {
  const path = buildPath('/tickets/{id}', { id });
  return apiClient.get<Ticket>(path);
}
```

---

## 💡 Best Practices

### 1. Always Use Generated Types

```typescript
// ✅ Good - Use generated types
import type { components } from '@/generated/api';
type Schedule = components['schemas']['Schedule'];

async function getSchedule(): Promise<Schedule> {
  return apiClient.get<Schedule>('/schedules/123');
}

// ❌ Bad - Manual types
interface Schedule {
  id: string;
  // Manual typing is error-prone and out of sync
}
```

### 2. Regenerate After OpenAPI Changes

```bash
# After updating docs/api-documentation.yaml
npm run generate:api

# Or use watch mode during development
npm run generate:api:watch
```

### 3. Type Path Parameters

```typescript
// ✅ Good - Type-safe path building
const path = buildPath('/schedules/{id}', { id: scheduleId });
const schedule = await apiClient.get<Schedule>(path);

// ❌ Bad - String concatenation
const schedule = await apiClient.get<Schedule>(`/schedules/${scheduleId}`);
```

### 4. Type Request Bodies

```typescript
// ✅ Good - Typed request body
import type { components } from '@/generated/api';
type CreateTicketDto = components['schemas']['CreateTicketDto'];

const ticket = await apiClient.post<Ticket, CreateTicketDto>('/tickets', {
  scheduleId: '123',
  passengers: [{ name: 'John' }], // TypeScript enforces correct structure
});

// ❌ Bad - Untyped request
const ticket = await apiClient.post('/tickets', {
  scheduleId: 123, // Type error not caught
});
```

### 5. Use Path Types for Complex Endpoints

```typescript
// ✅ Good - Extract path types
import type { paths } from '@/generated/api';

type GetSchedulesParams =
  paths['/schedules']['get']['parameters']['query'];
type GetSchedulesResponse =
  paths['/schedules']['get']['responses']['200']['content']['application/json'];

export async function getSchedules(
  params: GetSchedulesParams
): Promise<GetSchedulesResponse> {
  const query = buildQuery(params);
  return apiClient.get(`/schedules${query}`);
}
```

---

## 📝 Examples

### Example 1: Basic CRUD

```typescript
import { apiClient, buildPath } from '@/lib/api-client';
import type { components } from '@/generated/api';

type Schedule = components['schemas']['Schedule'];
type CreateScheduleDto = components['schemas']['CreateScheduleDto'];

// Create
const newSchedule = await apiClient.post<Schedule, CreateScheduleDto>(
  '/schedules',
  {
    routeId: 'route-123',
    vehicleId: 'vehicle-456',
    departureTime: '2025-01-20T08:00:00Z',
    price: 150000,
  }
);

// Read
const schedule = await apiClient.get<Schedule>(
  buildPath('/schedules/{id}', { id: newSchedule.id })
);

// Update
const updated = await apiClient.patch<Schedule>(
  buildPath('/schedules/{id}', { id: schedule.id }),
  { price: 175000 }
);

// Delete
await apiClient.delete(buildPath('/schedules/{id}', { id: schedule.id }));
```

### Example 2: Pagination

```typescript
import { apiClient, buildQuery } from '@/lib/api-client';
import type { components } from '@/generated/api';

type Schedule = components['schemas']['Schedule'];

interface PaginatedResponse {
  data: Schedule[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const query = buildQuery({
  page: 1,
  limit: 20,
  status: 'SCHEDULED',
  sortBy: 'cheapest',
});

const result = await apiClient.get<PaginatedResponse>(`/schedules${query}`);

console.log(`Page ${result.meta.page} of ${result.meta.totalPages}`);
console.log(`Total: ${result.meta.total} schedules`);
result.data.forEach((schedule) => {
  console.log(schedule.routeId, schedule.price);
});
```

### Example 3: File Upload

```typescript
import { apiClient } from '@/lib/api-client';
import type { components } from '@/generated/api';

type PaymentProof = components['schemas']['PaymentProof'];

const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('paymentProof', file);
formData.append('scheduleId', 'schedule-123');
formData.append('bookerPhone', '081234567890');
formData.append('passengers', JSON.stringify([
  { name: 'John Doe', seatNumber: 'A1' }
]));

const result = await apiClient.upload<PaymentProof>(
  '/payment-proofs',
  formData
);

console.log('Payment proof uploaded:', result.id);
```

### Example 4: Complex Filtering

```typescript
import { apiClient, buildQuery } from '@/lib/api-client';
import type { components, paths } from '@/generated/api';

// Use path query parameters type
type GetSchedulesParams =
  paths['/schedules']['get']['parameters']['query'];

type GetSchedulesResponse =
  paths['/schedules']['get']['responses']['200']['content']['application/json'];

async function searchSchedules(
  filters: GetSchedulesParams
): Promise<GetSchedulesResponse> {
  const query = buildQuery(filters);
  return apiClient.get<GetSchedulesResponse>(`/schedules${query}`);
}

// Type-safe usage
const results = await searchSchedules({
  origin: 'Jakarta',
  destination: 'Bandung',
  dateFrom: '2025-01-20T00:00:00Z',
  dateTo: '2025-01-25T23:59:59Z',
  status: 'SCHEDULED',
  sortBy: 'cheapest',
  page: 1,
  limit: 10,
});
```

### Example 5: React Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient, buildQuery } from '@/lib/api-client';
import type { components } from '@/generated/api';

type Schedule = components['schemas']['Schedule'];

export function ScheduleList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const query = buildQuery({ limit: 20, status: 'SCHEDULED' });
      const result = await apiClient.get<{ data: Schedule[] }>(
        `/schedules${query}`
      );
      setSchedules(result.data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {schedules.map((schedule) => (
        <div key={schedule.id}>
          {/* TypeScript knows all schedule properties! */}
          <p>Route: {schedule.routeId}</p>
          <p>Price: Rp {schedule.price.toLocaleString()}</p>
          <p>Seats: {schedule.availableSeats}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎉 Summary

Type-safe API client system provides:

✅ **Auto-generated Types** - From OpenAPI spec
✅ **Type Safety** - Compile-time type checking
✅ **IntelliSense** - Auto-complete in IDE
✅ **Sync with Backend** - Types always match API
✅ **Error Prevention** - Catch errors before runtime
✅ **Better DX** - Developer experience
✅ **Documentation** - Types serve as documentation

### Workflow

```
1. Update OpenAPI spec (docs/api-documentation.yaml)
   ↓
2. Generate types (npm run generate:api)
   ↓
3. Use generated types in services
   ↓
4. Build components with 100% type safety
   ↓
5. Enjoy auto-complete & compile-time errors!
```

**Never manually type API responses again!** 🚀
