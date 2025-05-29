'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LoginButton } from '@/components/auth/login-button'
import { Menu } from 'lucide-react'
import { useCurrentUser } from '@/hooks/use-current-user'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from '@/components/ui/sheet'

const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '#about' },
]

export function Header() {
  const user = useCurrentUser()
  const pathname = usePathname()

  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-sm">
      <nav
        className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <div className="h-8 w-8 bg-black rounded-md flex items-center justify-center">
              <span className="text-white font-bold">K</span>
            </div>
            <span className="font-semibold text-xl">Kleem AI</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <div className="flex items-center justify-between">
                <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                  <div className="h-8 w-8 bg-black rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">K</span>
                  </div>
                  <span className="font-semibold text-xl">Kleem AI</span>
                </Link>
                {/* SheetClose is automatically added by SheetContent if not explicitly used for the X icon,
                    or you can wrap the X icon with SheetClose if custom styling/positioning is needed.
                    The default X icon in SheetContent is usually at the top right.
                */}
              </div>
              <div className="mt-6 flow-root">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'block px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 rounded-lg',
                          pathname === item.href && 'bg-gray-50'
                        )}
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
                <div className="py-6">
                  <SheetClose asChild>
                    <LoginButton>
                      <Button variant="default" className="w-full" size="sm">
                        {user?.email ? 'Dashboard' : 'Log in'}
                      </Button>
                    </LoginButton>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600 transition-colors',
                pathname === item.href && 'text-black font-bold'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <LoginButton>
            <Button variant="default" size="sm">
              {user?.email ? 'Dashboard' : 'Log in'}
            </Button>
          </LoginButton>
        </div>
      </nav>
    </header>
  )
}
