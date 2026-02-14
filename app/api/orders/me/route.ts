import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

type LegacyOrder = {
  id: string
  order_number: string
  total_amount: number
  payment_method: string
  payment_status: string
  delivery_status: string
  customer_phone: string | null
  player_uid: string | null
  remarks: string | null
  payment_screenshot_url: string | null
  created_at: string
}

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const withStatus = await supabase
    .from('orders')
    .select(
      'id,order_number,total_amount,order_status,payment_method,payment_status,delivery_status,customer_phone,player_uid,remarks,payment_screenshot_url,created_at'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!withStatus.error) {
    return NextResponse.json({ orders: withStatus.data ?? [] })
  }

  const fallback = await supabase
    .from('orders')
    .select(
      'id,order_number,total_amount,payment_method,payment_status,delivery_status,customer_phone,player_uid,remarks,payment_screenshot_url,created_at'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (fallback.error) {
    return NextResponse.json({ error: fallback.error.message }, { status: 500 })
  }

  const orders = ((fallback.data ?? []) as LegacyOrder[]).map((order) => ({
    ...order,
    order_status: 'pending',
  }))

  return NextResponse.json({ orders })
}
