import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Rotas que NÃO precisam de autenticação
const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/signup(.*)',
  '/',
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
