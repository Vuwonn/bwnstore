'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

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

type CategoryProductsProps = {
  categories: StoreCategory[]
  products: StoreProduct[]
  isLoggedIn: boolean
  defaultCategory?: string
}

export default function CategoryProducts({
  categories,
  products,
  isLoggedIn,
  defaultCategory = 'all',
}: CategoryProductsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory)

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products
    return products.filter(
      (product) => product.category_id === selectedCategory || product.category === selectedCategory
    )
  }, [products, selectedCategory])

  const featuredProducts = products.slice(0, 8)

  const toCategorySlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedCategory === 'all' ? 'Category products' : 'Category products'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-orange-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategory(category.matchValue)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
              selectedCategory === category.matchValue
                ? 'bg-orange-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {category.title}
          </button>
        ))}
      </div>

      {(selectedCategory === 'all' ? featuredProducts : filteredProducts).length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          No products available right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(selectedCategory === 'all' ? featuredProducts : filteredProducts).map((product) => (
            <article key={product.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{product.name}</h3>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-8 w-8 rounded object-cover" />
                ) : (
                  <span className="text-base">💎</span>
                )}
              </div>

              <p className="line-clamp-1 text-xs text-gray-500">
                {product.description || 'No description available'}
              </p>
              <p className="mt-1 text-base font-bold text-orange-600">
                {product.currency} {product.price.toLocaleString()}
              </p>

              <div className="mt-2">
                {isLoggedIn ? (
                  <Link
                    href={`/checkout/${product.id}`}
                    className="inline-flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                  >
                    Buy now
                  </Link>
                ) : (
                  <Link
                    href={`/login?next=${encodeURIComponent(`/checkout/${product.id}`)}`}
                    className="inline-flex w-full justify-center rounded-md border border-orange-300 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
                  >
                    Login to buy
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedCategory !== 'all' && (
        <div className="mt-5 flex justify-end">
          <Link
            href={`/products/${encodeURIComponent(toCategorySlug(categories.find((c) => c.matchValue === selectedCategory)?.title || 'topup'))}`}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Open selected category
          </Link>
        </div>
      )}
    </section>
  )
}
