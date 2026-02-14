import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  image_url: string | null
}

type ProfileName = {
  full_name: string | null
  username: string | null
}

type CheckoutPageProps = {
  params: Promise<{ productId: string }>
  searchParams: Promise<{ qty?: string; uid?: string }>
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { productId } = await params
  const query = await searchParams
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/checkout/${productId}`)}`)
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name,username')
    .eq('id', user.id)
    .maybeSingle()
  const profile = profileData as ProfileName | null
  const displayName = profile?.full_name || profile?.username || 'User'

  const { data } = await supabase
    .from('products')
    .select('id,name,description,price,currency,image_url')
    .eq('id', productId)
    .single()
  const product = data as Product | null

  if (!product) {
    notFound()
  }

  const qty = Math.max(1, Number(query.qty || 1) || 1)
  const playerUid = (query.uid || '').trim()
  const subtotal = product.price * qty
  const paymentQrUrl = process.env.NEXT_PUBLIC_PAYMENT_QR_URL || ''

  const placeOrder = async (formData: FormData) => {
    'use server'

    const authClient = await createServerClient()
    const {
      data: { user: currentUser },
    } = await authClient.auth.getUser()

    if (!currentUser) {
      redirect(`/login?next=${encodeURIComponent(`/checkout/${productId}?qty=${qty}&uid=${playerUid}`)}`)
    }

    const orderNumber = `NS-${Date.now()}`
    const customerPhone = String(formData.get('customerPhone') || '').trim()
    const remarks = String(formData.get('remarks') || '').trim()
    const screenshotFile = formData.get('paymentScreenshot')

    if (!customerPhone) {
      throw new Error('Phone number is required')
    }

    if (!(screenshotFile instanceof File) || screenshotFile.size === 0) {
      throw new Error('Payment screenshot is required')
    }

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'product-images'
    const ext = screenshotFile.name.includes('.') ? screenshotFile.name.split('.').pop()?.toLowerCase() : 'jpg'
    const path = `payment-proofs/${currentUser.id}/${crypto.randomUUID()}.${ext || 'jpg'}`

    const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(path, screenshotFile, {
      contentType: screenshotFile.type || 'image/jpeg',
      upsert: false,
    })

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    const { data: imageData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: currentUser.id,
        order_number: orderNumber,
        total_amount: subtotal,
        order_status: 'pending',
        payment_method: 'qr',
        payment_status: 'pending',
        delivery_status: 'pending',
        customer_phone: customerPhone,
        player_uid: playerUid || null,
        remarks: remarks || null,
        payment_screenshot_url: imageData.publicUrl,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      throw new Error(orderError?.message || 'Failed to create order')
    }

    const { error: itemError } = await supabaseAdmin.from('order_items').insert({
      order_id: order.id,
      product_id: product.id,
      quantity: qty,
      price: product.price,
    })

    if (itemError) {
      throw new Error(itemError.message)
    }

    redirect('/dashboard?ordered=1')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-6xl p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_0.9fr]">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="mt-2 text-gray-600">You are purchasing this item as {displayName}</p>

            <div className="mt-6 rounded-lg border border-gray-200 p-4">
              <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
              <p className="mt-1 text-sm text-gray-600">{product.description || 'No description available'}</p>
              {playerUid && <p className="mt-2 text-sm text-gray-600">Player UID: {playerUid}</p>}
              <p className="mt-2 text-sm text-gray-600">Quantity: {qty}</p>
              <p className="mt-3 text-lg font-bold text-orange-600">
                {product.currency} {product.price.toLocaleString()}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                Subtotal: {product.currency} {subtotal.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <form action={placeOrder} className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-700">Scan QR and pay</p>
                {paymentQrUrl ? (
                  <img
                    src={paymentQrUrl}
                    alt="Payment QR"
                    className="mt-3 h-52 w-52 rounded-lg border border-gray-300 object-cover"
                  />
                ) : (
                  <p className="mt-2 text-sm text-amber-700">
                    Set `NEXT_PUBLIC_PAYMENT_QR_URL` in `.env.local` to show your QR.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Your number</label>
                <input
                  name="customerPhone"
                  type="text"
                  required
                  placeholder="98XXXXXXXX"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Remarks</label>
                <textarea
                  name="remarks"
                  rows={3}
                  placeholder="Write additional details..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Upload payment screenshot</label>
                <input
                  name="paymentScreenshot"
                  type="file"
                  accept="image/*"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white transition hover:bg-orange-700"
                >
                  Place order
                </button>
                <Link
                  href="/"
                  className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Back to products
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
