import { createServerClient } from '@/lib/supabase/server'

type ProfileAdmin = {
  is_admin: boolean
}

export async function getCurrentUserAndAdminStatus() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, isAdmin: false }
  }

  const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  const profile = data as ProfileAdmin | null

  return { user, isAdmin: Boolean(profile?.is_admin) }
}
