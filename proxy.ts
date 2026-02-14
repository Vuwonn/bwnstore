import type { NextRequest } from 'next/server'
import { middleware as supabaseMiddleware } from '@/lib/supabase/middleware'

export function proxy(req: NextRequest) {
  return supabaseMiddleware(req)
}

export const config = {
  matcher: ['/dashboard/:path*', '/checkout/:path*', '/api/:path*'],
}
