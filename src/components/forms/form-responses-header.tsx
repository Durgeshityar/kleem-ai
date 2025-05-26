'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Search, Filter, Download, Plus, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getUserForms } from '@/actions/form'
import { toast } from 'sonner'

interface Form {
  id: string
  name: string
  _count: {
    responses: number
  }
}

export function FormResponsesHeader() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('query') || ''
  )
  const [forms, setForms] = useState<Form[]>([])
  const selectedFormId = searchParams.get('formId')
  const currentSort = searchParams.get('sort')
  const currentDirection = searchParams.get('direction')

  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    try {
      const userForms = await getUserForms()
      setForms(userForms)
    } catch (error) {
      console.error('Error loading forms:', error)
      toast.error('Failed to load forms')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams)
    if (searchQuery) {
      params.set('query', searchQuery)
    } else {
      params.delete('query')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleFormFilter = (formId: string) => {
    const params = new URLSearchParams(searchParams)
    if (formId === 'all') {
      params.delete('formId')
    } else {
      params.set('formId', formId)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFormFilter = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('formId')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export functionality to be implemented')
  }

  const selectedForm = forms.find((form) => form.id === selectedFormId)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search responses..."
            className="w-full sm:w-[300px] pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    const params = new URLSearchParams(searchParams)
                    params.set('sort', 'createdAt')
                    params.set('direction', 'desc')
                    router.push(`${pathname}?${params.toString()}`)
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      currentSort === 'createdAt' && currentDirection === 'desc'
                        ? 'opacity-100'
                        : 'opacity-0'
                    }`}
                  />
                  Date (Newest first)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const params = new URLSearchParams(searchParams)
                    params.set('sort', 'createdAt')
                    params.set('direction', 'asc')
                    router.push(`${pathname}?${params.toString()}`)
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      currentSort === 'createdAt' && currentDirection === 'asc'
                        ? 'opacity-100'
                        : 'opacity-0'
                    }`}
                  />
                  Date (Oldest first)
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button asChild size="sm" className="h-9">
            <Link href="/forms">
              <Plus className="h-4 w-4 mr-2" />
              New Form
            </Link>
          </Button>
        </div>
      </div>

      {/* Form Filter Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Filter by form:
          </span>
          <Select
            value={selectedFormId || 'all'}
            onValueChange={handleFormFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All forms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All forms</SelectItem>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{form.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {form._count.responses}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {(selectedFormId ||
          searchQuery ||
          (currentSort && currentDirection)) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {selectedForm && (
              <Badge variant="outline" className="gap-1">
                Form: {selectedForm.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={clearFormFilter}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="outline" className="gap-1">
                Search: &ldquo;{searchQuery}&rdquo;
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => {
                    setSearchQuery('')
                    const params = new URLSearchParams(searchParams)
                    params.delete('query')
                    router.push(`${pathname}?${params.toString()}`)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {currentSort === 'createdAt' && currentDirection && (
              <Badge variant="outline" className="gap-1">
                Date:{' '}
                {currentDirection === 'desc' ? 'Newest first' : 'Oldest first'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams)
                    params.delete('sort')
                    params.delete('direction')
                    router.push(`${pathname}?${params.toString()}`)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
