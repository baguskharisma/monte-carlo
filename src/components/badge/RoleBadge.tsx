/**
 * RoleBadge Component
 * Display user role badges with consistent styling
 */

"use client"

import { Shield, UserCog, Truck, User } from "lucide-react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { USER_ROLES, type UserRole } from "@/lib/constants"
import type { BadgeSize } from "@/types/components.types"

const roleBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border font-medium transition-colors",
  {
    variants: {
      role: {
        SUPER_ADMIN:
          "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800",
        ADMIN:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
        DRIVER:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
        CUSTOMER:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
      },
      size: {
        sm: "text-xs h-5 gap-1 px-2",
        md: "text-sm h-6 gap-1.5 px-2.5",
        lg: "text-base h-7 gap-2 px-3",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface RoleBadgeProps {
  /** User role */
  role: UserRole
  /** Badge size */
  size?: BadgeSize
  /** Show icon before text */
  showIcon?: boolean
  /** Additional CSS classes */
  className?: string
}

// Role labels
const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  DRIVER: "Driver",
  CUSTOMER: "Customer",
}

// Role icons
const ROLE_ICONS: Record<UserRole, typeof Shield> = {
  SUPER_ADMIN: Shield,
  ADMIN: UserCog,
  DRIVER: Truck,
  CUSTOMER: User,
}

/**
 * RoleBadge - Displays user role with appropriate styling
 *
 * @example
 * ```tsx
 * <RoleBadge role="SUPER_ADMIN" showIcon />
 * <RoleBadge role="ADMIN" size="sm" />
 * <RoleBadge role="DRIVER" size="lg" showIcon />
 * ```
 */
export function RoleBadge({
  role,
  size = "md",
  showIcon = false,
  className,
}: RoleBadgeProps) {
  const label = ROLE_LABELS[role] || role
  const Icon = ROLE_ICONS[role]

  // Icon size based on badge size
  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size]

  return (
    <span
      data-slot="role-badge"
      data-role={role}
      className={cn(roleBadgeVariants({ role, size }), className)}
    >
      {showIcon && Icon && <Icon size={iconSize} className="flex-shrink-0" />}
      {label}
    </span>
  )
}
