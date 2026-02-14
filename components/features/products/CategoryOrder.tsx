"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  image_url: string | null
  stock_quantity: number
}

type Props = {
  products: Product[]
  categoryTitle: string
  categorySlug: string
  isLoggedIn: boolean
}

type CartItem = {
  id: string
  name: string
  qty: number
  price: number
  currency: string
}

const orderSchema = z.object({
  uid: z.string().regex(/^\d{9}$/, 'UID must be exactly 9 digits'),
  productId: z.string().min(1, 'Please select a product'),
  qty: z.number().int().min(1, 'Quantity must be at least 1'),
})

type OrderFormValues = z.infer<typeof orderSchema>

export default function CategoryOrder({ products, categoryTitle, categorySlug, isLoggedIn }: Props) {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    setValue,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      uid: '',
      productId: products[0]?.id ?? '',
      qty: 1,
    },
  })

  const productMap = useMemo(() => {
    const map: Record<string, Product> = {}
    products.forEach((p) => (map[p.id] = p))
    return map
  }, [products])

  const handleAdd = (data: OrderFormValues) => {
    const p = productMap[data.productId]
    if (!p) return

    // add to local cart first, then checkout explicitly
    setCart((prev) => {
      const existing = prev.find((it) => it.id === p.id)
      if (existing) {
        return prev.map((it) => (it.id === p.id ? { ...it, qty: it.qty + data.qty } : it))
      }
      return [...prev, { id: p.id, name: p.name, qty: data.qty, price: p.price, currency: p.currency }]
    })
    setValue('qty', 1)
  }

  const handleCheckout = () => {
    if (cart.length === 0) return

    const uidValue = getValues('uid')
    const uidCheck = orderSchema.pick({ uid: true }).safeParse({ uid: uidValue })
    if (!uidCheck.success) {
      setError('uid', { message: 'UID must be exactly 9 digits' })
      return
    }

    const latestItem = cart[cart.length - 1]
    if (!latestItem) return

    if (!isLoggedIn) {
      router.push(
        `/login?next=${encodeURIComponent(`/checkout/${latestItem.id}?qty=${latestItem.qty}&uid=${uidValue}`)}`
      )
      return
    }

    router.push(`/checkout/${latestItem.id}?qty=${latestItem.qty}&uid=${encodeURIComponent(uidValue)}`)
  }

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const total = cart.reduce((s, it) => s + it.qty * it.price, 0)

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <label className="rounded-md bg-gray-100 px-3 py-1 text-sm font-semibold">UID Login</label>
          <input
            placeholder="Player UID number"
            inputMode="numeric"
            maxLength={9}
            {...register('uid')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        {errors.uid && <p className="mb-3 text-xs text-red-600">{errors.uid.message}</p>}

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Choose category:</h3>
          <div className="mb-4">
            <input value={categoryTitle} readOnly className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <input
                type="number"
                min={1}
                {...register('qty', { valueAsNumber: true })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
              {errors.qty && <p className="mt-1 text-xs text-red-600">{errors.qty.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Product:</label>
              <select
                {...register('productId')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.currency} {p.price}
                  </option>
                ))}
              </select>
              {errors.productId && <p className="mt-1 text-xs text-red-600">{errors.productId.message}</p>}
            </div>

            <div className="md:col-span-3">
              <button
                type="button"
                onClick={handleSubmit(handleAdd)}
                className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900">Your items</h4>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Category</th>
                <th className="py-2">Product</th>
                <th className="py-2">Qty.</th>
                <th className="py-2">Price</th>
                <th className="py-2">Sub Total</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={6}>
                    No items yet.
                  </td>
                </tr>
              ) : (
                cart.map((it) => (
                  <tr key={it.id} className="border-t border-gray-100">
                    <td className="py-2 text-gray-700">{categoryTitle} [Available]</td>
                    <td className="py-2 text-gray-700">{it.name}</td>
                    <td className="py-2 text-gray-700">{it.qty}</td>
                    <td className="py-2 text-gray-700">{it.price}</td>
                    <td className="py-2 text-gray-700">{it.qty * it.price}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(it.id)}
                        className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-right">
          <div className="inline-block space-y-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="font-semibold">Total Rs. {total}</p>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
            >
              {isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
