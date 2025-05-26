import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { cookies } from 'next/headers'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

const ProtectedLayout = async ({ children }: ProtectedLayoutProps) => {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className="flex-1 w-full relative">
        <SidebarTrigger className="h-8 w-8 absolute top-4 sm:top-5  left-2 z-[11]" />
        <div className="relative z-[1]">{children}</div>
      </main>
    </SidebarProvider>
  )
}

export default ProtectedLayout
