'use client'

import React, { forwardRef, useRef, useState, useEffect } from 'react'

import { cn } from '@/lib/utils'
import { AnimatedBeam } from '@/components/ui/animated-beam'

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'z-10 flex items-center justify-center rounded-2xl border-[3px] border-black/10 bg-black p-4 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:scale-105 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)]',
        'size-16 md:size-20',
        className
      )}
    >
      {children}
    </div>
  )
})

Circle.displayName = 'Circle'

const MobileFrame = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'z-10 rounded-[40px] border-[12px] border-black bg-white p-1 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_12px_50px_-12px_rgba(0,0,0,0.4)]',
          'h-[500px] w-[300px] sm:h-[500px] sm:w-[320px] md:h-[600px] md:w-[350px]',
          className
        )}
      >
        {/* Status Bar */}
        <div className="relative h-6 w-full">
          <div className="absolute left-1/2 top-1 h-[22px] w-[120px] -translate-x-1/2 rounded-full bg-black" />
        </div>

        {/* Chat Container */}
        <div className="h-[calc(100%-3rem)] overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50 to-white p-2 sm:p-4">
          <div className="flex h-full flex-col">
            {/* Chat Header */}
            <div className="mb-2 flex items-center justify-between border-b border-gray-200 pb-2 sm:mb-4 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black sm:h-10 sm:w-10">
                  <span className="text-base font-bold text-white sm:text-lg">
                    K
                  </span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 sm:text-xs">
                    Powered by
                  </div>
                  <div className="text-sm font-semibold text-black sm:text-base">
                    Kleem AI
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 sm:h-2 sm:w-2" />
                <span className="text-[10px] text-gray-500 sm:text-xs">
                  Active
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto sm:space-y-4">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-black px-3 py-2 text-xs text-white sm:px-4 sm:text-sm">
                  Hi! I&apos;m Kleem AI assistant. To get started, please tell
                  me about your email id.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-gray-100 px-3 py-2 text-xs text-gray-800 sm:px-4 sm:text-sm">
                  johndoe@gmail.com
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-black px-3 py-2 text-xs text-white sm:px-4 sm:text-sm">
                  Great! First, could you tell me about your business goals?
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-[10px] text-gray-400 sm:text-xs">
                  Kleem AI is typing...
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="mt-2 border-t border-gray-200 pt-2 sm:mt-4 sm:pt-4">
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm sm:px-4 sm:py-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 sm:h-6 sm:w-6">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300 sm:h-3 sm:w-3" />
                </div>
                <div className="flex-1 text-xs text-gray-400 sm:text-sm">
                  Tell me more about your needs...
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black sm:h-6 sm:w-6">
                  <svg
                    className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center pt-1">
          <div className="h-1 w-24 rounded-full bg-black/10 sm:w-32" />
        </div>
      </div>
    )
  }
)

MobileFrame.displayName = 'MobileFrame'

export function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const div1Ref = useRef<HTMLDivElement>(null)
  const div2Ref = useRef<HTMLDivElement>(null)
  const div3Ref = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    handleResize() // Initial check
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      className="relative flex min-h-[600px] w-full max-w-[1200px] items-center justify-center overflow-hidden p-4 sm:min-h-[500px] sm:p-10 md:p-20"
      ref={containerRef}
    >
      <div className="flex size-full flex-col items-center justify-between gap-8 sm:gap-16 md:gap-32">
        <div className="flex flex-col items-center justify-center gap-12 sm:flex-row sm:items-center sm:justify-between sm:gap-16">
          <Circle ref={div1Ref}>
            <Icons.user className="h-6 w-6 sm:h-8 sm:w-8" />
          </Circle>
          <MobileFrame ref={div2Ref} className="scale-[0.95] sm:scale-100" />
          <Circle ref={div3Ref}>
            <Icons.form className="h-6 w-6 sm:h-8 sm:w-8" />
          </Circle>
        </div>
      </div>

      {/* Beams - Responsive for all screen sizes */}
      <div>
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div1Ref}
          toRef={div2Ref}
          startYOffset={0}
          endYOffset={0}
          curvature={isMobile ? 100 : 0}
        />

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div2Ref}
          toRef={div3Ref}
          startYOffset={0}
          endYOffset={0}
          curvature={isMobile ? -100 : 0}
        />
      </div>
    </div>
  )
}

const Icons = {
  openai: () => (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="2"
        width="14"
        height="20"
        rx="2"
        stroke="white"
        fill="none"
      />
      <line x1="5" y1="6" x2="19" y2="6" stroke="white" />
      <line x1="5" y1="18" x2="19" y2="18" stroke="white" />
      <circle cx="12" cy="20" r="1" fill="white" />
    </svg>
  ),
  user: ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  form: ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  ),
}
