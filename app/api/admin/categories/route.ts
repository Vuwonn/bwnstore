import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getCurrentUserAndAdminStatus } from '@/lib/auth/admin'

type CategoryPayload = {
  id?: string
  title?: string
  description?: string
  image_url?: string
}

async function ensureAdmin() {
  const { user, isAdmin } = await getCurrentUserAndAdminStatus()
  if (!user) {
    return { ok: false as const, status: 401, error: 'Unauthorized' }
  }
  if (!isAdmin) {
    return { ok: false as const, status: 403, error: 'Admin access required' }
  }
  return { ok: true as const }
}

export async function GET() {
  const admin = await ensureAdmin()
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id,title,description,image_url,created_at')
    .order('title', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ categories: data ?? [] })
}

export async function POST(request: Request) {
  const admin = await ensureAdmin()
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const payload = (await request.json()) as CategoryPayload
  if (!payload.title) {
    return NextResponse.json({ error: 'Missing category title' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      image_url: payload.image_url?.trim() || null,
    })
    .select('id,title,description,image_url,created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ category: data }, { status: 201 })
}

export async function PATCH(request: Request) {
  const admin = await ensureAdmin()
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const payload = (await request.json()) as CategoryPayload
  if (!payload.id || !payload.title) {
    return NextResponse.json({ error: 'Missing category id or title' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update({
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      image_url: payload.image_url?.trim() || null,
    })
    .eq('id', payload.id)
    .select('id,title,description,image_url,created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ category: data })
}
