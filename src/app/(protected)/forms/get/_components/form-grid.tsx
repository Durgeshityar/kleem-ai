'use client'

import { useRouter } from 'next/navigation'
import { FormCard } from './form-card'

interface Form {
  id: string
  title: string
  dateCreated: string
  lastModified: string
  isPublished: boolean
}

interface FormGridProps {
  forms: Form[]
  sortBy: 'dateCreated' | 'lastModified' | 'alphabetical'
  viewMode: 'grid' | 'list'
  isLoading: boolean
  onRename: (formId: string, newName: string) => Promise<void>
  onDelete: (formId: string) => Promise<void>
  onPublishToggle: (formId: string, currentStatus: boolean) => Promise<void>
}

export function FormGrid({
  forms,
  sortBy,
  viewMode,
  isLoading,
  onRename,
  onDelete,
  onPublishToggle,
}: FormGridProps) {
  const router = useRouter()

  // Find the most recently modified form
  const mostRecentlyModifiedForm =
    forms.length > 0
      ? forms.reduce((latest, current) => {
          const currentModified = new Date(current.lastModified)
          const latestModified = new Date(latest.lastModified)
          return currentModified > latestModified ? current : latest
        }, forms[0])
      : null

  const sortedForms = [...forms].sort((a, b) => {
    switch (sortBy) {
      case 'dateCreated':
        return (
          new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        )
      case 'lastModified':
        return (
          new Date(b.lastModified).getTime() -
          new Date(a.lastModified).getTime()
        )
      case 'alphabetical':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const handleCardClick = (formId: string) => {
    if (!isLoading) {
      router.push(`/forms?formId=${formId}`)
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div
        className={`grid ${
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'grid-cols-1 gap-2'
        }`}
      >
        {sortedForms.map((form) => (
          <FormCard
            key={form.id}
            form={form}
            isLatestModified={mostRecentlyModifiedForm?.id === form.id}
            isLoading={isLoading}
            onRename={onRename}
            onDelete={onDelete}
            onPublishToggle={onPublishToggle}
            onClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  )
}
