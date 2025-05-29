'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  MoreVertical,
  Trash,
  Pencil,
  X,
  Globe,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

interface Form {
  id: string
  title: string
  dateCreated: string
  lastModified: string
  isPublished: boolean
}

interface FormCardProps {
  form: Form
  isLatestModified: boolean
  isLoading: boolean
  onRename: (formId: string, newName: string) => Promise<void>
  onDelete: (formId: string) => Promise<void>
  onPublishToggle: (formId: string, currentStatus: boolean) => Promise<void>
  onClick: (formId: string) => void
}

export function FormCard({
  form,
  isLatestModified,
  isLoading,
  onRename,
  onDelete,
  onPublishToggle,
  onClick,
}: FormCardProps) {
  const [activeDropdown, setActiveDropdown] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(form.title)
  const [linkCopied, setLinkCopied] = useState(false)

  const getShareableLink = (formId: string) => {
    return `${process.env.NEXT_PUBLIC_APP_URL}/f/${formId}`
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!form.isPublished) {
      toast.error('Publish the form first to get a shareable link')
      return
    }

    try {
      await navigator.clipboard.writeText(getShareableLink(form.id))
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
      toast.success('Link copied to clipboard')
    } catch (error) {
      console.error('Error copying link:', error)
      toast.error('Failed to copy link')
    } finally {
      setActiveDropdown(false)
    }
  }

  const handleRename = async () => {
    if (!newName.trim()) {
      toast.error('Form name cannot be empty')
      return
    }

    await onRename(form.id, newName.trim())
    setEditingName(false)
  }

  return (
    <div
      className={`p-4 border rounded-lg relative group ${
        isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
      }`}
    >
      <div
        className={`${!isLoading ? 'cursor-pointer' : ''}`}
        onClick={() => !isLoading && onClick(form.id)}
      >
        {editingName ? (
          <div
            className="flex flex-col gap-3 pr-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 shadow-sm p-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 min-w-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                placeholder="Enter new name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRename()
                  } else if (e.key === 'Escape') {
                    setEditingName(false)
                    setNewName(form.title)
                  }
                }}
                autoFocus
              />
              <div className="flex items-center gap-1.5 pr-1">
                <button
                  onClick={handleRename}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium transition-colors shadow-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingName(false)
                    setNewName(form.title)
                  }}
                  className="p-1.5 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium pr-8 truncate text-gray-900">
                {form.title}
              </h3>
              <div className="mt-2 text-sm text-gray-500">
                <div>
                  Created: {new Date(form.dateCreated).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {isLatestModified && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs">
                      Last Modified
                    </span>
                  )}
                  {form.isPublished && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                        Live
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* More Options Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (!isLoading) {
              setActiveDropdown(!activeDropdown)
            }
          }}
          className={`p-1 rounded-md ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
          }`}
          disabled={isLoading}
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>

        {/* Dropdown Menu */}
        {activeDropdown && !isLoading && (
          <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border z-20">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setEditingName(true)
                setActiveDropdown(false)
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="w-4 h-4" />
              Rename
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPublishToggle(form.id, form.isPublished)
                setActiveDropdown(false)
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {form.isPublished ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Publish
                </>
              )}
            </button>
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 border-t ${
                form.isPublished
                  ? 'text-gray-700'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy
                    className={`w-4 h-4 ${
                      !form.isPublished ? 'opacity-50' : ''
                    }`}
                  />
                  {form.isPublished ? 'Copy Link' : 'Publish to Copy Link'}
                </>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(form.id)
                setActiveDropdown(false)
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 border-t"
            >
              <Trash className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
