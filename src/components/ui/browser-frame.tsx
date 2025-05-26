'use client'

import React, { useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { PenLine, BarChart, Plug } from 'lucide-react'
import { MockFormEditor } from '../marketing/mock-form-editor'
import { MockResponsePage } from '../marketing/mock-response-page'
import { MockSettingPage } from '../marketing/mock-setting-page'

interface Tab {
  id: string
  label: string
  icon: React.ReactNode
  content: React.ReactNode
}

interface BrowserFrameProps {
  url?: string
}

export function BrowserFrame({ url = 'www.kleem.ai.com' }: BrowserFrameProps) {
  const [activeTab, setActiveTab] = React.useState('form-builder')
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // Memoize the tab contents to prevent recreation
  const memoizedTabContents = useMemo(
    () => ({
      'form-builder': <MockFormEditor />,
      responses: <MockResponsePage />,
      integration: <MockSettingPage />,
    }),
    []
  )

  const defaultTabs: Tab[] = useMemo(
    () => [
      {
        id: 'form-builder',
        label: 'Form builder',
        icon: <PenLine className="w-4 h-4" />,
        content: memoizedTabContents['form-builder'],
      },
      {
        id: 'responses',
        label: 'Responses',
        icon: <BarChart className="w-4 h-4" />,
        content: memoizedTabContents['responses'],
      },
      {
        id: 'integration',
        label: 'Integration',
        icon: <Plug className="w-4 h-4" />,
        content: memoizedTabContents['integration'],
      },
    ],
    [memoizedTabContents]
  )

  // Transform values for the tilt effect
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 0.6, 1],
    [15, 0, 0, 0, 0]
  )
  const scale = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 0.6, 1],
    [0.95, 1, 1, 1, 1]
  )
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 0.6, 1],
    [0.8, 1, 1, 1, 1]
  )

  return (
    <div
      ref={containerRef}
      className="py-8 sm:py-12 md:py-16 lg:py-20 perspective-1000"
    >
      {/* Tab Navigation - Moved outside the frame */}
      <div className="flex justify-center mb-2 sm:mb-4 px-2">
        <div className="inline-flex bg-white rounded-lg p-1 shadow-md overflow-x-auto max-w-full">
          {defaultTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          transformOrigin: 'center center',
        }}
        className="rounded-lg border shadow-xl overflow-hidden bg-white transform-gpu will-change-transform mx-2 sm:mx-4 md:mx-6"
      >
        {/* Browser Header */}
        <div className="bg-gray-100 border-b px-2 sm:px-4 py-2">
          {/* Traffic Lights */}
          <div className="flex items-center">
            <div className="flex space-x-1.5 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
            </div>

            {/* URL Bar */}
            <div className="flex-1 mx-2 sm:mx-4">
              <div className="bg-white rounded-md flex items-center px-2 sm:px-3 py-1">
                <div className="flex-shrink-0 text-gray-400">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                </div>
                <span className="ml-2 text-xs sm:text-sm text-gray-600 truncate">
                  {url}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="h-[400px] sm:h-[500px] md:h-[600px] bg-white overflow-auto">
          {defaultTabs.find((tab) => tab.id === activeTab)?.content}
        </div>
      </motion.div>
    </div>
  )
}
