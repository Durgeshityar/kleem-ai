import { FormEditor } from '@/components/forms/form-editor'
import { currentUser } from '@/lib/auth-util'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ formId?: string }>
}

export default async function NewFormPage({ searchParams }: PageProps) {
  const params = await searchParams
  const formId = params?.formId

  const user = await currentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const formToEdit = formId
    ? await db.form.findUnique({
        where: {
          id: formId,
          userId: user.id,
        },
        include: {
          nodes: true,
          edges: true,
        },
      })
    : null

  return (
    <>
      <FormEditor formToEdit={formToEdit || undefined} />
    </>
  )
}
