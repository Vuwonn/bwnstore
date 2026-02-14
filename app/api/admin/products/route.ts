import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getCurrentUserAndAdminStatus } from '@/lib/auth/admin'

type ProductPayload = {
  id?: string
  name?: string
  description?: string
  category?: string
  category_id?: string | null
  price?: number
  currency?: string
  image_url?: string
  stock_quantity?: number
  is_available?: boolean
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
    .from('products')
    .select('*, categories:categories(id,title,description,image_url)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ products: data ?? [] })
}

export async function POST(request: Request) {
  const admin = await ensureAdmin()
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const payload = (await request.json()) as ProductPayload
  if (!payload.name || payload.price === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name: payload.name,
      description: payload.description ?? null,
      category: payload.category || 'General',
      category_id: payload.category_id ?? null,
      price: payload.price,
      currency: payload.currency || 'NPR',
      image_url: payload.image_url || null,
      stock_quantity: payload.stock_quantity ?? 0,
      is_available: payload.is_available ?? true,
    })
    .select('*, categories:categories(id,title,description,image_url)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ product: data }, { status: 201 })
}

export async function PATCH(request: Request) {
  const admin = await ensureAdmin()
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const payload = (await request.json()) as ProductPayload
  if (!payload.id) {
    return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
  }

  const updates: ProductPayload = {}
  if (payload.name !== undefined) updates.name = payload.name
  if (payload.description !== undefined) updates.description = payload.description
  if (payload.category !== undefined) updates.category = payload.category
  if (payload.category_id !== undefined) updates.category_id = payload.category_id
  if (payload.price !== undefined) updates.price = payload.price
  if (payload.currency !== undefined) updates.currency = payload.currency
  if (payload.image_url !== undefined) updates.image_url = payload.image_url
  if (payload.stock_quantity !== undefined) updates.stock_quantity = payload.stock_quantity
  if (payload.is_available !== undefined) updates.is_available = payload.is_available

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', payload.id)
    .select('*, categories:categories(id,title,description,image_url)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ product: data })
}

export async function DELETE(request: Request) {
  const admin = await ensureAdmin()
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const payload = (await request.json()) as ProductPayload
  if (!payload.id) {
    return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('products').delete().eq('id', payload.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
