/**
 * SearchInput Component
 * Search input with debounce functionality
 */

"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  /** Current search value */
  value?: string
  /** Callback when search value changes (debounced) */
  onSearch: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Debounce delay in milliseconds */
  debounce?: number
  /** Show clear button */
  showClear?: boolean
  /** Additional CSS classes */
  className?: string
  /** Input CSS classes */
  inputClassName?: string
}

/**
 * SearchInput - Search input with debounce
 *
 * @example
 * ```tsx
 * <SearchInput
 *   placeholder="Search users..."
 *   onSearch={(value) => setSearchTerm(value)}
 *   debounce={300}
 * />
 * ```
 */
export function SearchInput({
  value: controlledValue,
  onSearch,
  placeholder = "Search...",
  debounce = 300,
  showClear = true,
  className,
  inputClassName,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(controlledValue || "")

  // Sync controlled value changes
  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== localValue) {
      setLocalValue(controlledValue)
    }
  }, [controlledValue])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localValue)
    }, debounce)

    return () => clearTimeout(timer)
  }, [localValue, debounce, onSearch])

  const handleClear = () => {
    setLocalValue("")
    onSearch("")
  }

  return (
    <div data-slot="search-input" className={cn("relative", className)}>
      {/* Search icon */}
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      {/* Input */}
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className={cn("pl-9", showClear && localValue && "pr-9", inputClassName)}
      />

      {/* Clear button */}
      {showClear && localValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
