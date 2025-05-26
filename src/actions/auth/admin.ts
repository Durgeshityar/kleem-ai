'use server'

import { currentRole } from '@/lib/auth-util'
import { UserRole } from '@prisma/client'

export const admin = async () => {
  const role = await currentRole()

  if (role === UserRole.ADMIN) {
    return { success: true, status: 200 }
  }

  return { success: false, status: 403, error: 'Forbidden' }
}
