'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'react-toastify'

type ProfileName = {
  full_name: string | null
  username: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('User')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login?next=/dashboard/profile')
          return
        }

        setEmail(user.email || '')
        const { data } = await supabase
          .from('profiles')
          .select('full_name,username')
          .eq('id', user.id)
          .maybeSingle()

        const profile = data as ProfileName | null
        const fallbackName = (user.user_metadata?.full_name as string | undefined)?.trim()
        setDisplayName(profile?.full_name || profile?.username || fallbackName || 'User')
      } catch {
        // no-op for profile read failures
      }
    }

    void loadProfile()
  }, [router])

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault()

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.')
      return
    }

    setSaving(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password changed successfully.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="mt-3 text-gray-700">
              Name: <span className="font-semibold">{displayName}</span>
            </p>
            <p className="mt-2 text-gray-700">
              Email: <span className="font-semibold">{email || '-'}</span>
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
