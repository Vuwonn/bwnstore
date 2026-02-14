import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUserAndAdminStatus } from '@/lib/auth/admin'
import { createServerClient } from '@/lib/supabase/server'

type ProfileName = {
  full_name: string | null
  username: string | null
}

export default async function DashboardPage() {
  const { user, isAdmin } = await getCurrentUserAndAdminStatus()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('full_name,username')
    .eq('id', user.id)
    .maybeSingle()
  const profile = data as ProfileName | null
  const displayName = profile?.full_name || profile?.username || 'User'

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-3 text-gray-600">
          Logged in as <span className="font-medium">{displayName}</span>
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white transition hover:bg-orange-700"
          >
            Go to home
          </Link>
          {isAdmin && (
            <Link
              href="/dashboard/cms"
              className="ml-3 inline-flex rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Open Product CMS
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
