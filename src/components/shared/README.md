# Shared Components

Kumpulan komponen UI yang dapat digunakan kembali di seluruh aplikasi.

## 📋 Daftar Komponen

### 1. DataTable
Tabel data dengan fitur sorting, filtering, dan pagination.

**Features:**
- ✅ Sortable columns
- ✅ Global search
- ✅ Column filters
- ✅ Pagination
- ✅ Column visibility toggle
- ✅ Responsive design
- ✅ Empty state & loading state

**Usage:**
```tsx
import { DataTable } from '@/components/shared'

const columns = [
  {
    key: 'name',
    title: 'Name',
    sortable: true,
    filterable: true,
  },
  {
    key: 'email',
    title: 'Email',
    sortable: true,
  },
  {
    key: 'status',
    title: 'Status',
    render: (value) => <Badge>{value}</Badge>
  },
]

const data = [
  { name: 'John Doe', email: 'john@example.com', status: 'active' },
  { name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
]

<DataTable
  data={data}
  columns={columns}
  searchable
  searchPlaceholder="Search users..."
  pageSize={10}
/>
```

---

### 2. StatCard & MetricCard
Kartu statistik untuk menampilkan metrics.

**Usage:**
```tsx
import { StatCard, MetricCard } from '@/components/shared'
import { DollarSign } from 'lucide-react'

<StatCard
  title="Total Revenue"
  value="$85,420"
  icon={<DollarSign className="h-4 w-4" />}
  description="Total revenue this month"
  trend={{ value: 12.5, isPositive: true }}
  loading={false}
/>

<MetricCard
  label="Active Users"
  value="1,234"
  icon={<Users className="h-4 w-4" />}
  change={{ value: 8.2, period: 'last month' }}
  variant="success"
/>
```

---

### 3. Loading Skeletons
Skeleton screens untuk loading states.

**Available Skeletons:**
- `CardSkeleton` - Loading untuk card
- `StatCardSkeleton` - Loading untuk stat card
- `TableSkeleton` - Loading untuk tabel
- `ListSkeleton` - Loading untuk list
- `ChartSkeleton` - Loading untuk chart
- `FormSkeleton` - Loading untuk form
- `PageSkeleton` - Loading untuk full page

**Usage:**
```tsx
import {
  StatCardSkeleton,
  TableSkeleton,
  PageSkeleton
} from '@/components/shared'

// Loading state untuk stat cards
<div className="grid gap-4 md:grid-cols-4">
  {Array.from({ length: 4 }).map((_, i) => (
    <StatCardSkeleton key={i} />
  ))}
</div>

// Loading state untuk tabel
<TableSkeleton rows={10} columns={5} />

// Loading state untuk full page
<PageSkeleton />
```

---

### 4. Empty States
Komponen untuk menampilkan empty states dan error states.

**Available Components:**
- `EmptyState` - Generic empty state
- `EmptyStateCard` - Empty state dalam card
- `NoSearchResults` - Empty state untuk search results
- `NoData` - Empty state untuk data kosong
- `ErrorState` - Error state
- `NotFound` - 404 state

**Usage:**
```tsx
import {
  EmptyState,
  NoSearchResults,
  NoData,
  ErrorState
} from '@/components/shared'

// Generic empty state
<EmptyState
  title="No items found"
  description="Get started by creating your first item."
  action={{
    label: "Create item",
    onClick: () => console.log("Create")
  }}
/>

// No search results
<NoSearchResults
  searchTerm={searchQuery}
  onClear={() => setSearchQuery('')}
/>

// No data
<NoData
  resource="bookings"
  onAdd={() => router.push('/bookings/new')}
/>

// Error state
<ErrorState
  title="Failed to load data"
  description="Something went wrong. Please try again."
  onRetry={() => refetch()}
/>
```

---

### 5. Error Boundary
React Error Boundary untuk menangkap errors.

**Features:**
- ✅ Catch React errors
- ✅ Custom fallback UI
- ✅ Error logging
- ✅ Reset functionality
- ✅ Development mode stack trace
- ✅ HOC support

**Usage:**
```tsx
import {
  ErrorBoundary,
  withErrorBoundary,
  MinimalErrorFallback
} from '@/components/shared'

// Wrap component
<ErrorBoundary
  fallback={MinimalErrorFallback}
  onError={(error, errorInfo) => {
    console.error('Error:', error)
    // Send to error tracking service
  }}
>
  <YourComponent />
</ErrorBoundary>

// Using HOC
const SafeComponent = withErrorBoundary(YourComponent, {
  fallback: MinimalErrorFallback
})
```

---

## 🎨 UI Primitives

Komponen UI dasar yang sudah dibuat:

### Dialog/Modal
```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description here.</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Toast Notifications
```tsx
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

// Add to layout
<Toaster />

// In component
const { toast } = useToast()

toast({
  title: "Success!",
  description: "Your changes have been saved.",
  variant: "success"
})

toast({
  title: "Error!",
  description: "Something went wrong.",
  variant: "destructive"
})
```

### Select
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Dropdown Menu
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Skeleton
```tsx
import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-4 w-[200px]" />
<Skeleton className="h-8 w-full" />
```

---

## 📦 Installation

Semua dependencies sudah terinstall:
- `@radix-ui/react-dialog`
- `@radix-ui/react-toast`
- `@radix-ui/react-select`
- `@radix-ui/react-dropdown-menu`

---

## 🎯 Best Practices

1. **Gunakan TypeScript types** untuk type safety
2. **Import dari index files** untuk cleaner imports:
   ```tsx
   // ✅ Good
   import { DataTable, StatCard } from '@/components/shared'

   // ❌ Avoid
   import { DataTable } from '@/components/shared/DataTable'
   import { StatCard } from '@/components/shared/StatCard'
   ```
3. **Gunakan loading skeletons** untuk better UX
4. **Wrap komponen dengan ErrorBoundary** untuk error handling
5. **Gunakan empty states** untuk data kosong

---

## 📝 Notes

- Semua komponen sudah responsive
- Menggunakan Tailwind CSS untuk styling
- Compatible dengan dark mode
- Accessible (ARIA labels, keyboard navigation)
- Type-safe dengan TypeScript
