import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin'
import { extractRouterConfig } from 'uploadthing/server'
import { ourFileRouter } from './api/uploadthing/core'
import { connection } from 'next/server'
import { Suspense } from 'react'

const inter = Inter({
  subsets: ['latin'],
})

async function UTSSR() {
  await connection()
  return <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          <Suspense fallback={<div>Loading...</div>}>
            <UTSSR />
            <Toaster />
            {children}
          </Suspense>
        </body>
      </html>
    </SessionProvider>
  )
}
