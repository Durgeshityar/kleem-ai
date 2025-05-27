/**
 * An array of routes that is accessible to public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ['/', '/auth/new-verification', '/f', '/f/:path*']

/**
 * An array of routes that is accessible to public
 * These routes will redirect loggedin users to /settings
 * @type {string[]}
 */
export const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/error',
  '/auth/reset',
  '/auth/new-password',
]

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication process
 * @type {string[]}
 */
export const apiAuthPrefix = '/api/auth'

/**
 * The default redirected path after log in
 * @type {string[]}
 */
export const DEFAULT_LOGIN_REDIRECT = '/forms/get'
