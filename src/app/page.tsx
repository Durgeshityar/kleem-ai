'use client'

import { Header } from '@/components/marketing/header'
import { Button } from '@/components/ui/button'
import { ArrowRight, Signal } from 'lucide-react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { BrowserFrame } from '@/components/ui/browser-frame'
import Link from 'next/link'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { AnimatedBeamDemo } from '@/components/marketing/animated-beam-features'
import { useCurrentUser } from '@/hooks/use-current-user'

export default function Home() {
  const user = useCurrentUser()
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      {/* Hero Section */}
      <section className="flex-1 pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            {/* New Tag */}
            <div className="flex items-center gap-2">
              <span className="bg-[#E8FB60] px-2 py-1 text-sm font-medium rounded-md">
                New
              </span>
              <Link
                href="#"
                className="text-gray-700 hover:text-gray-900 font-medium flex items-center gap-1"
              >
                Embed Code <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Main Heading */}
            <TypingAnimation
              duration={30}
              className="text-[32px] md:text-[48px] lg:text-[64px] font-bold leading-[1.1] tracking-tight text-gray-900 max-w-3xl"
            >
              Transform forms into natural conversations
            </TypingAnimation>

            {/* Description */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-2xl">
              Meet the{' '}
              <span className="font-medium text-gray-900">
                conversational AI form platform
              </span>{' '}
              built to make your forms more engaging.
            </p>

            {/* CTA and Stats */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center mt-6 sm:mt-8">
              <Link
                href={user ? '/forms/get' : '/auth/login'}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
                >
                  Get started now <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>

              {/* Social Proof */}
              <div className="flex flex-col gap-2">
                <div className="flex -space-x-2">
                  <Avatar className="w-10 h-10 border-2 border-white">
                    <AvatarImage
                      src="https://randomuser.me/api/portraits/women/17.jpg"
                      alt="User"
                    />
                  </Avatar>
                  <Avatar className="w-10 h-10 border-2 border-white">
                    <AvatarImage
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt="User"
                    />
                  </Avatar>
                  <Avatar className="w-10 h-10 border-2 border-white">
                    <AvatarImage
                      src="https://randomuser.me/api/portraits/women/44.jpg"
                      alt="User"
                    />
                  </Avatar>
                  <Avatar className="w-10 h-10 border-2 border-white">
                    <AvatarImage
                      src="https://randomuser.me/api/portraits/men/86.jpg"
                      alt="User"
                    />
                  </Avatar>
                  <Avatar className="w-10 h-10 border-2 border-white">
                    <AvatarImage
                      src="https://randomuser.me/api/portraits/women/63.jpg"
                      alt="User"
                    />
                  </Avatar>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">200+ forms created</p>
                  <span className="text-gray-600">•</span>
                  <p className="text-gray-600 flex items-center gap-1">
                    <Signal className="h-4 w-4" /> Verifiable by Analytics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browser Demo Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <BrowserFrame />
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto mt-8 sm:mt-16 md:mt-24max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808014_1px,transparent_1px),linear-gradient(to_bottom,#80808014_1px,transparent_1px)] bg-[size:14px_14px] sm:bg-[size:24px_24px]"></div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-0">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 text-center sm:text-left">
            Chat-based forms that understand your users
          </h2>
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl text-center sm:text-left">
            Create forms that adapt, learn, and engage in natural conversations
            with your users.
          </p>
        </div>
        <div className="mx-auto mt-8 sm:mt-12 md:mt-16 lg:mt-24 lg:max-w-none">
          <AnimatedBeamDemo />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mt-16 sm:mt-24 lg:mt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 sm:gap-8">
            {/* Section Header */}
            <div className="flex flex-col gap-3 sm:gap-4 max-w-xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
                The outcomes don&apos;t lie
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">
                Completion rate of forms built with Kleem AI is 2x higher than
                traditional forms.
              </p>
            </div>

            {/* Testimonial Card */}
            <div className="w-full">
              <div className="rounded-xl sm:rounded-2xl bg-gray-50 p-4 sm:p-6 lg:p-8 max-w-3xl">
                <div className="flex flex-col gap-4 sm:gap-6">
                  <p className="text-base sm:text-lg text-gray-900">
                    Implementing Kleem AI&apos;s conversational forms has been a
                    game-changer for our customer onboarding process. The
                    natural dialogue flow makes complex form filling feel like
                    chatting with a friendly assistant. We&apos;ve seen our
                    completion rates skyrocket, and the feedback from our users
                    has been overwhelmingly positive. The AI&apos;s ability to
                    adapt and guide users through the process while maintaining
                    a human touch is remarkable. It&apos;s not just a form -
                    it&apos;s an engaging experience that keeps users invested
                    until the very end.
                  </p>

                  <div className="flex flex-row items-start sm:items-center gap-4">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                      <AvatarImage
                        src="https://randomuser.me/api/portraits/women/42.jpg"
                        alt="User"
                      />
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-900">Sarah Chen</p>
                      <p className="text-sm sm:text-base text-gray-600">
                        Head of Product, TechFlow Solutions
                      </p>
                    </div>
                    <div className="hidden sm:block ml-auto">
                      <svg
                        className="h-8 w-8"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="40" height="40" rx="8" fill="#0284c7" />
                        <path
                          d="M10 20.5C10 15.2533 14.2533 11 19.5 11C24.7467 11 29 15.2533 29 20.5C29 25.7467 24.7467 30 19.5 30C14.2533 30 10 25.7467 10 20.5Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose the perfect plan for your needs. All plans include
              unlimited conversations and core features.
            </p>
          </div>
          <div className="isolate mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
            {/* Free Tier */}
            <div className="rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-8 text-gray-900">
                  Free
                </h3>
                <p className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold leading-5 text-gray-600">
                  Get Started
                </p>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                Perfect for trying out Kleem AI
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  $0
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  /month
                </span>
              </p>
              <Link
                href="/auth/login"
                className="mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 bg-gray-50 text-gray-700 hover:bg-gray-100"
              >
                Get started for free
              </Link>
              <ul
                role="list"
                className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
              >
                <li className="flex gap-x-3">
                  <svg
                    className="h-6 w-5 flex-none text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Up to 100 form submissions
                </li>
                <li className="flex gap-x-3">
                  <svg
                    className="h-6 w-5 flex-none text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Basic analytics
                </li>
                <li className="flex gap-x-3">
                  <svg
                    className="h-6 w-5 flex-none text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  48-hour support response time
                </li>
              </ul>
            </div>

            {/* Pro Tier */}
            <div className="rounded-3xl p-8 ring-1 ring-blue-200 xl:p-10 bg-blue-50 relative hover:shadow-xl transition-all duration-200">
              <div className="absolute -top-3 left-0 right-0 mx-auto w-32 rounded-full bg-blue-600 px-3 py-1 text-center text-sm font-medium text-white">
                Most Popular
              </div>
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-8 text-gray-900">
                  Pro
                </h3>
                <p className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-700">
                  Best Value
                </p>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                For growing businesses and teams
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  $49
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  /month
                </span>
              </p>
              <Link
                href="/auth/login"
                className="mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 bg-blue-600 text-white hover:bg-blue-500"
              >
                Get started
              </Link>
              <ul
                role="list"
                className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
              >
                <li className="flex gap-x-3">
                  <svg
                    className="h-6 w-5 flex-none text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Unlimited form submissions
                </li>
                <li className="flex gap-x-3">
                  <svg
                    className="h-6 w-5 flex-none text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Advanced analytics and reporting
                </li>
                <li className="flex gap-x-3">
                  <svg
                    className="h-6 w-5 flex-none text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Custom branding
                </li>
                <li className="flex gap-x-3">
                  <svg
                    className="h-6 w-5 flex-none text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Priority support (24h)
                </li>
              </ul>
            </div>

            {/* Enterprise Tier */}
            <div className="rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-8 text-gray-900">
                  Enterprise
                </h3>
                <p className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold leading-5 text-gray-600">
                  Custom
                </p>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                For organizations with custom needs
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  Custom
                </span>
              </p>
              <Link
                href="/auth/login"
                className="mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 bg-gray-50 text-gray-700 hover:bg-gray-100"
              >
                Contact sales
              </Link>
              <ul
                role="list"
                className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
              >
                <li className="flex gap-x-3">
                  <svg
                    className="h-6 w-5 flex-none text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Everything in Pro
                </li>
                <li className="flex gap-x-3">
                  <svg
                    className="h-6 w-5 flex-none text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Custom AI model training
                </li>
                <li className="flex gap-x-3">
                  <svg
                    className="h-6 w-5 flex-none text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Dedicated account manager
                </li>
                <li className="flex gap-x-3">
                  <svg
                    className="h-6 w-5 flex-none text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  24/7 premium support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
