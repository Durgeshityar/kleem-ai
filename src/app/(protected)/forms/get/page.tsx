'use client'

import { useState, useEffect } from 'react'
import {
  getAllForms,
  deleteFormById,
  renameForm,
  publishForm,
} from '@/actions/form'
import { toast } from 'sonner'
import { FormSettings } from '@/types/form'
import { Header } from './_components/header'
import { FormGrid } from './_components/form-grid'

type ViewMode = 'grid' | 'list'
type SortBy = 'dateCreated' | 'lastModified' | 'alphabetical'

interface Form {
  id: string
  title: string
  dateCreated: string
  lastModified: string
  isPublished: boolean
}

export default function FormsPage() {
  const [sortBy, setSortBy] = useState<SortBy>('dateCreated')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadForms = async () => {
    try {
      setIsLoading(true)
      const data = await getAllForms()
      if (!data) return

      const formattedForms = data.map((form) => ({
        id: form.id,
        title: form.name,
        dateCreated: form.createdAt.toISOString(),
        lastModified: form.updatedAt.toISOString(),
        isPublished:
          (form.settings as unknown as FormSettings).isPublished ?? false,
      }))

      setForms(formattedForms)
    } catch (error) {
      console.error('Error loading forms:', error)
      toast.error('Failed to load forms')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadForms()
  }, [])

  const handleRename = async (formId: string, newName: string) => {
    try {
      setIsLoading(true)
      await renameForm(formId, newName)
      await loadForms()
      toast.success('Form renamed successfully')
    } catch (error) {
      console.error('Error renaming form:', error)
      toast.error('Failed to rename form')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (formId: string) => {
    try {
      setIsLoading(true)
      await deleteFormById(formId)
      await loadForms()
      toast.success('Form deleted successfully')
    } catch (error) {
      console.error('Error deleting form:', error)
      toast.error('Failed to delete form')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublishToggle = async (
    formId: string,
    currentStatus: boolean
  ) => {
    try {
      setIsLoading(true)
      await publishForm(formId, !currentStatus)
      await loadForms()
      toast.success(
        `Form ${!currentStatus ? 'published' : 'unpublished'} successfully`
      )
    } catch (error) {
      console.error('Error toggling form publish status:', error)
      toast.error('Failed to update form status')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Header
        sortBy={sortBy}
        viewMode={viewMode}
        onSortChange={setSortBy}
        onViewChange={setViewMode}
        disabled={isLoading}
      />
      <FormGrid
        forms={forms}
        sortBy={sortBy}
        viewMode={viewMode}
        isLoading={isLoading}
        onRename={handleRename}
        onDelete={handleDelete}
        onPublishToggle={handlePublishToggle}
      />
    </div>
  )
}
