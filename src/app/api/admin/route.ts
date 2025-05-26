// This file is deprecated. Please use the admin server action from src/actions/auth/admin.ts instead
// The functionality has been moved to server actions for better performance and simplicity

import { currentRole } from '@/lib/auth-util'
import { UserRole } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function GET() {
  const role = await currentRole()

  if (role === UserRole.ADMIN) {
    return new NextResponse(null, { status: 200 })
  }
  return new NextResponse(null, { status: 403 })
}
