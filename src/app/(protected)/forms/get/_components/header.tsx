'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronDown, Grid, List, Plus } from 'lucide-react'

type ViewMode = 'grid' | 'list'
type SortBy = 'dateCreated' | 'lastModified' | 'alphabetical'

interface HeaderProps {
  sortBy: SortBy
  viewMode: ViewMode
  onSortChange: (sort: SortBy) => void
  onViewChange: (mode: ViewMode) => void
  disabled: boolean
}

export function Header({
  sortBy,
  viewMode,
  onSortChange,
  onViewChange,
  disabled,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()

  const sortOptions = [
    { value: 'dateCreated', label: 'Date Created' },
    { value: 'lastModified', label: 'Last Modified' },
    { value: 'alphabetical', label: 'Alphabetical' },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full px-4 sm:px-8 py-4 border-b gap-4 sm:gap-0">
      <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
        <h1 className="text-xl sm:text-2xl font-semibold ml-6 sm:ml-3">
          My Workspace
        </h1>
        <Button
          onClick={() => router.push('/forms')}
          variant="default"
          className="ml-6"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Form
        </Button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Sort Dropdown */}
        <div className="relative flex-1 sm:flex-none">
          <button
            onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center justify-between w-full sm:w-auto gap-2 px-3 py-2 rounded-md border hover:bg-gray-50 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={disabled}
          >
            <span className="truncate">
              {sortOptions.find((opt) => opt.value === sortBy)?.label}
            </span>
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          </button>

          {isDropdownOpen && !disabled && (
            <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white rounded-md shadow-lg border z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value as SortBy)
                    setIsDropdownOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Toggle */}
        <button
          onClick={() =>
            !disabled && onViewChange(viewMode === 'grid' ? 'list' : 'grid')
          }
          className={`p-2 rounded-md border hover:bg-gray-50 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={disabled}
          aria-label="Toggle view"
        >
          {viewMode === 'grid' ? (
            <List className="w-5 h-5" />
          ) : (
            <Grid className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}
