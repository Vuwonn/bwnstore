import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getCurrentUserAndAdminStatus } from '@/lib/auth/admin'

type OrderStatus = 'pending' | 'approved' | 'completed'

type OrderUpdatePayload = {
  orderId?: string
  orderStatus?: OrderStatus
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
    .from('orders')
    .select(
      'id,order_number,user_id,total_amount,order_status,payment_method,payment_status,delivery_status,customer_phone,player_uid,remarks,payment_screenshot_url,created_at'
    )
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ orders: data ?? [] })
}

export async function PATCH(request: Request) {
  const admin = await ensureAdmin()
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const payload = (await request.json()) as OrderUpdatePayload
  const allowed: OrderStatus[] = ['pending', 'approved', 'completed']
  if (!payload.orderId || !payload.orderStatus || !allowed.includes(payload.orderStatus)) {
    return NextResponse.json({ error: 'Invalid order status update payload' }, { status: 400 })
  }

  const statusMap = {
    pending: { payment_status: 'pending', delivery_status: 'pending' },
    approved: { payment_status: 'approved', delivery_status: 'pending' },
    completed: { payment_status: 'approved', delivery_status: 'completed' },
  } as const

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({
      order_status: payload.orderStatus,
      payment_status: statusMap[payload.orderStatus].payment_status,
      delivery_status: statusMap[payload.orderStatus].delivery_status,
    })
    .eq('id', payload.orderId)
    .select(
      'id,order_number,user_id,total_amount,order_status,payment_method,payment_status,delivery_status,customer_phone,player_uid,remarks,payment_screenshot_url,created_at'
    )
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ order: data })
}
