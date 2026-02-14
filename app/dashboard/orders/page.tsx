'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-toastify'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProofImageViewer from '@/components/common/ProofImageViewer'

type MyOrder = {
  id: string
  order_number: string
  total_amount: number
  order_status: 'pending' | 'approved' | 'completed' | string
  payment_method: string
  payment_status: string
  delivery_status: string
  customer_phone: string | null
  player_uid: string | null
  remarks: string | null
  payment_screenshot_url: string | null
  created_at: string
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<MyOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ordered, setOrdered] = useState(false)
  const [placedOrderNumber, setPlacedOrderNumber] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const isOrdered = params.get('ordered') === '1'
    const orderNumber = params.get('order') || ''
    setOrdered(isOrdered)
    setPlacedOrderNumber(orderNumber)

    if (isOrdered) {
      toast.success(`Order placed successfully${orderNumber ? ` (${orderNumber})` : ''}`)
    }
  }, [])

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/orders/me', { cache: 'no-store' })
        const result = (await response.json()) as { orders?: MyOrder[]; error?: string }
        if (!response.ok) throw new Error(result.error || 'Failed to load orders')
        setOrders(result.orders ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    void loadOrders()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-6xl p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-1 text-sm text-gray-600">Track your order status and payment proof review.</p>
          {ordered && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              Order placed successfully{placedOrderNumber ? ` (${placedOrderNumber})` : ''}. We will review and update
              status soon.
            </div>
          )}

          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          {loading ? (
            <p className="mt-6 text-gray-600">Loading your orders...</p>
          ) : orders.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-6 text-center">
              <p className="text-gray-600">You don’t have any orders yet.</p>
              <Link
                href="/"
                className="mt-3 inline-flex rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="px-3 py-2 font-semibold">Order</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">Amount</th>
                    <th className="px-3 py-2 font-semibold">Phone</th>
                    <th className="px-3 py-2 font-semibold">UID</th>
                    <th className="px-3 py-2 font-semibold">Proof</th>
                    <th className="px-3 py-2 font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-gray-900">{order.order_number}</p>
                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            order.order_status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : order.order_status === 'approved'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {order.order_status}
                        </span>
                        <p className="mt-1 text-[11px] text-gray-500">
                          Pay: {order.payment_status} | Delivery: {order.delivery_status}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-gray-700">Rs. {order.total_amount.toLocaleString()}</td>
                      <td className="px-3 py-3 text-gray-700">{order.customer_phone || '-'}</td>
                      <td className="px-3 py-3 text-gray-700">{order.player_uid || '-'}</td>
                      <td className="px-3 py-3 text-gray-700">
                        {order.payment_screenshot_url ? (
                          <ProofImageViewer imageUrl={order.payment_screenshot_url} label="View" />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-3 py-3 text-gray-700">{order.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
