'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Calendar, X } from 'lucide-react'
import { subDays, subMonths, format } from 'date-fns'
import type { DateRange, DateRangePreset } from '@/types/driver-trip.types'

interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

interface PresetOption {
  label: string
  value: DateRangePreset
  getDates: () => DateRange
}

const PRESETS: PresetOption[] = [
  {
    label: '7 Hari Terakhir',
    value: 'last_7_days',
    getDates: () => ({
      from: subDays(new Date(), 7),
      to: new Date(),
    }),
  },
  {
    label: '30 Hari Terakhir',
    value: 'last_30_days',
    getDates: () => ({
      from: subDays(new Date(), 30),
      to: new Date(),
    }),
  },
  {
    label: '3 Bulan Terakhir',
    value: 'last_3_months',
    getDates: () => ({
      from: subMonths(new Date(), 3),
      to: new Date(),
    }),
  },
]

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset | null>(null)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  // Initialize custom dates when value changes from outside
  useEffect(() => {
    if (value.from && value.to) {
      setCustomFrom(format(value.from, 'yyyy-MM-dd'))
      setCustomTo(format(value.to, 'yyyy-MM-dd'))
    }
  }, [value])

  const handlePresetClick = (preset: PresetOption) => {
    const dates = preset.getDates()
    setSelectedPreset(preset.value)
    onChange(dates)
    setIsOpen(false)
  }

  const handleCustomDateChange = () => {
    if (customFrom && customTo) {
      const fromDate = new Date(customFrom)
      const toDate = new Date(customTo)

      // Validate that from date is before to date
      if (fromDate <= toDate) {
        onChange({
          from: fromDate,
          to: toDate,
        })
        setSelectedPreset('custom')
        setIsOpen(false)
      }
    }
  }

  const handleClear = () => {
    onChange({ from: null, to: null })
    setSelectedPreset(null)
    setCustomFrom('')
    setCustomTo('')
  }

  const getDisplayText = () => {
    if (!value.from || !value.to) {
      return 'Pilih Rentang Tanggal'
    }

    if (selectedPreset && selectedPreset !== 'custom') {
      const preset = PRESETS.find((p) => p.value === selectedPreset)
      return preset?.label || 'Rentang Khusus'
    }

    return `${format(value.from, 'dd/MM/yyyy')} - ${format(value.to, 'dd/MM/yyyy')}`
  }

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="flex-1">{getDisplayText()}</span>
            {value.from && value.to && (
              <X
                className="ml-2 h-4 w-4 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            {/* Presets */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preset</Label>
              <div className="grid grid-cols-1 gap-2">
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={selectedPreset === preset.value ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start"
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="space-y-2 border-t pt-4">
              <Label className="text-sm font-medium">Rentang Khusus</Label>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="date-from" className="text-xs text-muted-foreground">
                    Dari
                  </Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    max={customTo || format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="date-to" className="text-xs text-muted-foreground">
                    Sampai
                  </Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    min={customFrom}
                    max={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleCustomDateChange}
                  disabled={!customFrom || !customTo}
                >
                  Terapkan Rentang Khusus
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
