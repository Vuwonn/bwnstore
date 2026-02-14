import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getCurrentUserAndAdminStatus } from '@/lib/auth/admin'

type UserRolePayload = {
  userId?: string
  isAdmin?: boolean
}

async function ensureAdmin() {
  const { user, isAdmin } = await getCurrentUserAndAdminStatus()
  if (!user) {
    return { ok: false as const, status: 401, error: 'Unauthorized', currentUserId: null }
  }
  if (!isAdmin) {
    return { ok: false as const, status: 403, error: 'Admin access required', currentUserId: user.id }
  }
  return { ok: true as const, currentUserId: user.id }
}

export async function GET() {
  const admin = await ensureAdmin()
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id,username,full_name,is_admin,created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: data ?? [] })
}

export async function PATCH(request: Request) {
  const admin = await ensureAdmin()
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const payload = (await request.json()) as UserRolePayload
  if (!payload.userId || payload.isAdmin === undefined) {
    return NextResponse.json({ error: 'Missing userId or isAdmin' }, { status: 400 })
  }

  if (payload.userId === admin.currentUserId && !payload.isAdmin) {
    return NextResponse.json({ error: 'You cannot remove your own admin access' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ is_admin: payload.isAdmin })
    .eq('id', payload.userId)
    .select('id,username,full_name,is_admin,created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ user: data })
}
