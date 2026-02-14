'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Home, Package, User, LogOut, Menu, X } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type ProfileName = {
  full_name: string | null
  username: string | null
}

export default function Header() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadUserName = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!mounted || !user) {
          setDisplayName(null)
          return
        }

        const { data } = await supabase
          .from('profiles')
          .select('full_name,username')
          .eq('id', user.id)
          .maybeSingle()
        const profile = data as ProfileName | null

        if (!mounted) return

        const profileName = profile?.full_name || profile?.username
        const fallbackName = (user.user_metadata?.full_name as string | undefined) || 'User'
        setDisplayName(profileName || fallbackName)
      } catch {
        if (mounted) setDisplayName(null)
      }
    }

    loadUserName()
    return () => {
      mounted = false
    }
  }, [])

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    setMobileOpen(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 bg-orange-500 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold md:text-2xl">
            Gaming Shop Np
          </Link>

          <div className="hidden items-center space-x-6 md:flex">

            <Link href="/" className="flex items-center transition hover:text-orange-200">
              <Home className="w-5 h-5 mr-1" />
              Home
            </Link>

            <Link href="/dashboard/orders" className="flex items-center transition hover:text-orange-200">
              <Package className="w-5 h-5 mr-1" />
              My Orders
            </Link>

            <Link href="/dashboard/profile" className="flex items-center transition hover:text-orange-200">
              <User className="w-5 h-5 mr-1" />
              {displayName || 'Account'}
            </Link>

            {displayName ? (
              <button
                onClick={handleLogout}
                className="flex items-center transition hover:text-orange-200"
              >
                <LogOut className="w-5 h-5 mr-1" />
                Logout
              </button>
            ) : (
              <Link href="/login" className="flex items-center transition hover:text-orange-200">
                <User className="w-5 h-5 mr-1" />
                Login
              </Link>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center rounded-md border border-white/20 p-2 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mt-3 space-y-3 rounded-lg bg-orange-600/95 p-3 md:hidden">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <Link href="/" onClick={() => setMobileOpen(false)} className="rounded-md px-2 py-2 hover:bg-white/10">
                Home
              </Link>
              <Link
                href="/dashboard/orders"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2 hover:bg-white/10"
              >
                My Orders
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2 hover:bg-white/10"
              >
                {displayName || 'Account'}
              </Link>
              {displayName ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md px-2 py-2 text-left hover:bg-white/10"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-2 hover:bg-white/10"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}