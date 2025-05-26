import { Suspense } from 'react'
import { currentUser } from '@/lib/auth-util'
import { redirect } from 'next/navigation'
import { FormResponsesHeader } from '@/components/forms/form-responses-header'
import { FormResponsesTable } from '@/components/forms/form-responses-table'
import { FormResponsesTableSkeleton } from '@/components/forms/form-responses-table-skeleton'

interface PageProps {
  searchParams: Promise<{
    query?: string
    formId?: string
    page?: string
    sort?: string
    direction?: string
  }>
}

export default async function ResponsesPage({ searchParams }: PageProps) {
  const user = await currentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const params = await searchParams

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-4 space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight ml-8 sm:ml-0">
          Form Responses
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          View and manage all form submissions across your forms.
        </p>
      </div>

      <FormResponsesHeader />

      <Suspense fallback={<FormResponsesTableSkeleton />}>
        <FormResponsesTable searchParams={params} />
      </Suspense>
    </div>
  )
}
