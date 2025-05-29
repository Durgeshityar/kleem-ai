'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  Hand,
  Link,
  MousePointer,
  Type,
  CheckSquare,
  Star,
  List,
  Calendar,
  ToggleLeft,
  Loader,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormNodeData } from '@/types/form'

interface FloatingToolbarProps {
  onAddNode: (type: FormNodeData['type']) => void
  onDelete: () => void
  onDuplicate: () => void
  hasSelection: boolean
  isSaving: boolean
  className?: string
  mode: 'select' | 'pan' | 'connect'
  onModeChange: (mode: 'select' | 'pan' | 'connect') => void
}

export default function FloatingToolbar({
  onAddNode,
  onDelete,
  onDuplicate,
  hasSelection,
  isSaving,
  className,
  mode,
  onModeChange,
}: FloatingToolbarProps) {
  return (
    <div
      className={cn(
        'fixed left-1/2 top-[40%] -translate-x-1/2 bg-white rounded-lg shadow-md p-1 flex items-center gap-1 border border-gray-200',
        'w-auto max-w-[calc(100vw-2rem)] overflow-x-auto',
        className
      )}
    >
      {isSaving && (
        <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-gray-50 rounded mr-1 shrink-0">
          <Loader className="animate-spin h-4 w-4 text-gray-500" />
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 shrink-0 min-w-7 px-2"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-sm">Add Question</span>
            <ChevronDown className="h-3 w-3 opacity-50 hidden sm:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => onAddNode('text')}>
            <Type className="h-4 w-4 mr-2" />
            Text Input
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNode('multipleChoice')}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Multiple Choice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNode('rating')}>
            <Star className="h-4 w-4 mr-2" />
            Rating
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNode('dropdown')}>
            <List className="h-4 w-4 mr-2" />
            Dropdown
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNode('date')}>
            <Calendar className="h-4 w-4 mr-2" />
            Date Picker
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNode('boolean')}>
            <ToggleLeft className="h-4 w-4 mr-2" />
            Yes/No Toggle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNode('media')}>
            <Upload className="h-4 w-4 mr-2" />
            Media Upload
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />

      <Button
        variant="ghost"
        size="icon"
        className={cn('h-7 w-7 shrink-0', mode === 'select' && 'bg-gray-100')}
        onClick={() => onModeChange('select')}
        title="Select Mode"
      >
        <MousePointer className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-7 w-7 shrink-0', mode === 'pan' && 'bg-gray-100')}
        onClick={() => onModeChange('pan')}
        title="Pan Mode"
      >
        <Hand className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-7 w-7 shrink-0 transition-colors',
          mode === 'connect' &&
            'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800'
        )}
        onClick={() => onModeChange('connect')}
        title="Connect Mode"
      >
        <Link
          className={cn('h-3.5 w-3.5', mode === 'connect' && 'animate-pulse')}
        />
      </Button>

      <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={onDelete}
        disabled={!hasSelection}
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={onDuplicate}
        disabled={!hasSelection}
        title="Duplicate"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
