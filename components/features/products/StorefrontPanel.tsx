'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import CategoryProducts from '@/components/features/products/CategoryProducts'

type StoreCategory = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  matchValue: string
}

type StoreProduct = {
  id: string
  name: string
  description: string | null
  category: string
  category_id: string | null
  price: number
  currency: string
  image_url: string | null
}

type StorefrontPanelProps = {
  categories: StoreCategory[]
  products: StoreProduct[]
  isLoggedIn: boolean
}

export default function StorefrontPanel({ categories, products, isLoggedIn }: StorefrontPanelProps) {
  const toCategorySlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const sortedCategories = useMemo(() => {
    const freeFire = categories.find((c) => c.title.toLowerCase().includes('free fire'))
    const others = categories.filter((c) => c !== freeFire)
    return freeFire ? [freeFire, ...others] : categories
  }, [categories])

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Browse by category</h2>
        </div>

        {sortedCategories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-gray-600">
            Categories will appear here once you add them in CMS.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products/${encodeURIComponent(toCategorySlug(category.title))}`}
                className="overflow-hidden rounded-xl border border-gray-200 text-left shadow-sm transition hover:border-orange-300 hover:shadow-md"
              >
                <div className="h-36 w-full bg-gray-100">
                  {category.image_url ? (
                    <img src={category.image_url} alt={category.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-linear-to-r from-orange-100 to-orange-200 text-sm font-semibold text-orange-700">
                      {category.title}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-lg font-semibold text-gray-900">{category.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{category.description || 'Top-up items for this game'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <CategoryProducts categories={sortedCategories} products={products} isLoggedIn={isLoggedIn} defaultCategory="all" />
    </div>
  )
}
